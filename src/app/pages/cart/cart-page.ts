import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TransactionService } from '../../services/transaction-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CartService } from '../../services/cart-service-front';
import { ProductCard } from "../../components/product-card/product-card";
import { Product } from '../../models/product';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-page',
  imports: [ReactiveFormsModule, ProductCard],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css'
})
export class CartPage implements OnInit {

  private aService = inject(AuthService)
  private tService = inject(TransactionService)
  private fb = inject(FormBuilder)
  private cService = inject(CartService)
  private router = inject(Router)

  checkoutForm!: FormGroup
  permits = this.aService.permits()
  selectedItems = signal<Set<number>>(new Set())

  ngOnInit(): void {
    this.checkoutForm = this.fb.group({
      paymentMethod: ["CASH", Validators.required],
      type: ["SALE"],
      storeName: [""],
      description: [""]
    })
  }

  get cartItems() {
    return this.cService.cartItems;
  }

  total = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.priceWithDiscount! * item.stock, 0)
  )

  selectedTotal = computed(() => {
    const selected = this.selectedItems()
    return this.cartItems().reduce((sum, item) => {
      if (selected.has(item.id)) sum += item.price * item.stock
      return sum
    }, 0)
  })

  toggleSelection(id: number, checked: boolean) {
    const updated = new Set(this.selectedItems())
    if (checked) updated.add(id)
    else updated.delete(id)
    this.selectedItems.set(updated)
  }

  removeFromCart(id: number) {
    this.cService.removeFromCart(id)
    const updated = new Set(this.selectedItems())
    updated.delete(id)
    this.selectedItems.set(updated)
  }

  removeSelected() {
    const selected = this.selectedItems()
    this.cService.removeItemsByIds(Array.from(selected))
    this.selectedItems.set(new Set())
  }

  updateQuantity(item: Product, newQty: number) {
    this.cService.updateQuantity(item, newQty)
  }

  async changeQuantity(item: Product, unidad: number) {
    const newQty = item.stock + unidad
    if (newQty < 1) {
      Swal.fire({
        icon: "warning",
        title: "Cantidad mínima alcanzada",
        text: "No puedes tener menos de 1 unidad."
      });
      return
    }

    try {
      await this.cService.updateQuantity(item, newQty)

    } catch (e: any) {
      Swal.fire({
        icon: "warning",
        title: "Oops..",
        text: e.message ?? "Hubo un error al actualizar la cantidad"
      })
    }
  }

  onSubmit() {
    const selectedIds = this.selectedItems()
    let productsToBuy: Product[]

    if (selectedIds.size > 0) {
      productsToBuy = this.cartItems().filter(item => selectedIds.has(item.id))
    } else {
      productsToBuy = this.cartItems()
    }

    if (!productsToBuy.length) {
      Swal.fire({
        icon: "warning",
        title: "Carrito Vacío",
        text: "Debes tener al menos un producto en el carrito o seleccionado para comprar."
      });
      return
    }

    if (this.checkoutForm.valid) {
      const user = this.aService.user()

      if (!user) {
        Swal.fire({
          icon: "warning",
          title: "Usuario no logueado",
          text: "Necesitás iniciar sesión antes de completar la compra",
          confirmButtonText: "Iniciar sesión"
        }).then(() => {
          this.router.navigate(['/auth/login'])
        })
        return
      }

      const payload = this.cService.prepareSaleRequest(this.checkoutForm.value, user.id, productsToBuy)

      if (!payload) return

      this.tService.postSale(payload).subscribe({
        next: () => {
          this.cService.removeItemsByIds(productsToBuy.map(p => p.id))
          this.selectedItems.set(new Set())
          this.checkoutForm.reset({
            paymentMethod: "CASH",
            type: "SALE",
            storeName: "",
            description: ""
          })

          Swal.fire({
            icon: "success",
            title: "Okey!",
            text: "Transacción realizada correctamente"
          }).then(() => {
            Swal.fire({
              title: "¿Ver compras?",
              text: "También puedes quedarte por aquí",
              icon: "question",
              showCancelButton: true,
              confirmButtonText: "Ir a compras",
              cancelButtonText: "Permanecer en tu carrito",
              reverseButtons: true
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['/purchases'])
              }
            })
          })
        },
        error: (e) => {
          console.error("Error preparando transacción", e)
          Swal.fire({
            icon: "error",
            title: "Oops..",
            text: "Hubo un error al realizar la transacción",
            footer: e
          })
        }
      })
    }
  }
}