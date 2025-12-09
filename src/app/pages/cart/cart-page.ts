import { Component, inject, OnInit, signal } from '@angular/core';
import { TransactionService } from '../../services/transaction-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Cart, DetailCart } from '../../models/cart/cartResponse';
import { CartService } from '../../services/cart-service';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MercadopagoButton } from '../../components/mercadopago-button/mercadopago-button';
@Component({
  selector: 'app-cart-page',
  imports: [ReactiveFormsModule, CommonModule, MercadopagoButton],
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
  items: DetailCart[] = []
  selectedItems = signal<Set<number>>(new Set())

  ngOnInit(): void {

    this.checkoutForm = this.fb.group({
      paymentMethod: ["CASH", Validators.required],
      type: ["SALE"],
      storeName: [""],
      description: [""]
    })

    this.cartItems().subscribe({
      next: cart => {
        this.items = cart.items;
        const allIds = this.items.map(item => item.id!);
        this.selectedItems.set(new Set(allIds));
      },
      error: err => {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Oops..",
          text: "Hubo un error al cargar los items del carrito"
        })
      }
    })
  }

  cartItems(): Observable<Cart> {
    return this.cService.getCart(this.aService.user()!.id!)
  }

  selectedTotal() {
    const selected = this.selectedItems()
    return this.items.reduce((sum, item) => {
      if (selected.has(item.id!)) sum += item.subtotal || 0
      return sum
    }, 0)
  }

  products() {
    const selected = this.selectedItems()
    return this.items.reduce((sum, item) => {
      if (selected.has(item.id!)) sum += item.quantity || 0
      return sum
    }, 0)
  }

  get total(): number {
    return this.selectedTotal();
  }

  toggleSelection(id: number, checked: boolean) {
    const updated = new Set(this.selectedItems())
    if (checked) updated.add(id)
    else updated.delete(id)
    this.selectedItems.set(updated)
  }

  toggleAll() {
    const isAllSelected = this.items.length > 0 && this.selectedItems().size === this.items.length;

    if (isAllSelected) {
      this.selectedItems.set(new Set());
    } else {
      const allIds = this.items.map(item => item.id!);
      this.selectedItems.set(new Set(allIds));
    }
  }

  get allSelected(): boolean {
    return this.items.length > 0 && this.selectedItems().size === this.items.length;
  }

  removeFromCart(id: number) {
    this.cService.removeItem(this.aService.user()!.id!, id).subscribe({
      next: () => {
        this.items = this.items.filter(item => item.id !== id)
        const updated = new Set(this.selectedItems());
        updated.delete(id);
        this.selectedItems.set(updated);
      }
    })
  }

  removeSelected() {
    const selected = this.selectedItems()
    for (let id of selected) {
      this.cService.removeItem(this.aService.user()!.id!, id).subscribe({
        next: () => {
          this.items = this.items.filter(item => item.id !== id)
        }
      })
    }
    this.selectedItems.set(new Set())
  }

  updateQuantity(id: number, newQty: number) {
    this.cService.updateItemQuantity(this.aService.user()!.id!, id, newQty)
      .subscribe({
        next: updated => {
          this.items = updated.items;
        }
      })
  }

  async changeQuantity(item: DetailCart, unidad: number) {
    const newQty = item.quantity! + unidad
    if (newQty < 1) {
      Swal.fire({
        icon: "warning",
        title: "Cantidad mínima alcanzada",
        text: "No puedes tener menos de 1 unidad."
      });
      return
    }

    try {
      await this.updateQuantity(item.id!, newQty)

    } catch (e: any) {
      Swal.fire({
        icon: "warning",
        title: "Oops..",
        text: e.message ?? "Hubo un error al actualizar la cantidad"
      })
    }
  }

  goToDetailProduct(id?: number) {
    this.router.navigate(["products/details/", id]);
  }

  onSubmit() {
    const selectedIds = this.selectedItems()
    const cartItemsToBuy = this.items.filter(item => selectedIds.has(item.id!))

    if (!cartItemsToBuy.length) {
      Swal.fire({
        icon: "warning",
        title: "Ningún producto seleccionado",
        text: "Selecciona al menos un producto para continuar con la compra."
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

      const payload = this.cService.prepareSaleRequest(this.checkoutForm.value, user.id!, cartItemsToBuy)

      if (!payload) return

      this.tService.postSale(payload).subscribe({
        next: () => {
          for (const ci of cartItemsToBuy) {
            if (ci.id) {
              this.cService.removeItem(user.id!, ci.id).subscribe({
                next: () => {
                  this.items = this.items.filter(item => item.id !== ci.id)
                  const updated = new Set(this.selectedItems())
                  updated.delete(ci.id!)
                  this.selectedItems.set(updated)
                },
                error: err => console.error('Error removing item after purchase', err)
              })
            }
          }

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
