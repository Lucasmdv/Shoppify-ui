import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { TransactionService } from '../../services/transaction-service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { DetailCart } from '../../models/cart/cartResponse';
import { CartSignal } from '../../services/cart-signal';
import { CartService } from '../../services/cart-service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-cart-page',
  templateUrl: './cart-page.html',
  styleUrls: ['./cart-page.css'],
  imports: [CurrencyPipe, ReactiveFormsModule]
})
export class CartPage implements OnInit {

  private aService = inject(AuthService)
  private cSignalService = inject(CartSignal)
  private cService = inject(CartService)
  private tService = inject(TransactionService)
  private fb = inject(FormBuilder)
  private router = inject(Router)

  checkoutForm!: FormGroup
  items = signal<DetailCart[]>([])
  selectedItems = signal<Set<number>>(new Set())
  permits = this.aService.permits()

  ngOnInit() {
    this.checkoutForm = this.fb.group({
      paymentMethod: ['CASH', Validators.required],
      type: ['SALE'],
      storeName: [''],
      description: ['']
    })

    const user = this.aService.user()
    if (user) this.cSignalService.syncCart(user.id!)

    effect(() => {
      const cart = this.cSignalService.cartSignal()
      if (cart) {
        this.items.set(cart.items);
        const allIds = cart.items.map(i => i.id!)
        this.selectedItems.set(new Set(allIds))
      }
    })
  }

  selectedTotal() {
    const selected = this.selectedItems()
    return this.items().reduce((sum, item) => selected.has(item.id!) ? sum + (item.subtotal || 0) : sum, 0)
  }

  products() {
    const selected = this.selectedItems()
    return this.items().reduce((sum, item) => selected.has(item.id!) ? sum + (item.quantity || 0) : sum, 0)
  }

  toggleSelection(id: number, checked: boolean) {
    const updated = new Set(this.selectedItems())
    if (checked) updated.add(id)
    else updated.delete(id)
    this.selectedItems.set(updated)
  }

  toggleAll() {
    const allSelected = this.items().length > 0 && this.selectedItems().size === this.items().length;
    if (allSelected) this.selectedItems.set(new Set());
    else this.selectedItems.set(new Set(this.items().map(i => i.id!)));
  }

  goToDetailProduct(id: number) {
    this.router.navigate(['/product', id]);
  }

  get allSelected() {
    return this.items().length > 0 && this.selectedItems().size === this.items().length;
  }

  async changeQuantity(item: DetailCart, delta: number) {
    const newQty = item.quantity! + delta
    if (newQty < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Cantidad mínima',
        text: 'No puedes tener menos de 1.'
      })
      return
    }

    const user = this.aService.user()
    if (!user) return

    this.cSignalService.updateItemQuantity(user.id!, item.id!, newQty)
  }

  removeFromCart(id: number) {
    const user = this.aService.user()
    if (!user) return

    this.cSignalService.removeItem(user.id!, id)
    const updated = new Set(this.selectedItems())
    updated.delete(id)
    this.selectedItems.set(updated)
  }

  async onSubmit() {
    const user = this.aService.user()
    if (!user) return;

    const selectedIds = this.selectedItems()
    const cartItemsToBuy = this.items().filter(i => selectedIds.has(i.id!))
    if (!cartItemsToBuy.length) return

    const payload = this.cService.prepareSaleRequest(this.checkoutForm.value, user.id!, cartItemsToBuy)
    if (!payload) return

    try {
      await firstValueFrom(this.tService.postSale(payload))

      await Promise.all(
        cartItemsToBuy
          .filter(ci => ci.id)
          .map(ci => this.cSignalService.removeItem(user.id!, ci.id!))
      )

      await this.cSignalService.syncCart(user.id!)

      this.selectedItems.set(new Set())
      this.checkoutForm.reset({
        paymentMethod: "CASH",
        type: "SALE",
        storeName: "",
        description: ""
      })

      Promise.resolve().then(() => {
        Swal.fire({
          icon: "success",
          title: "Transacción realizada correctamente",
        }).then(() => {
          Swal.fire({
            title: "¿Ver compras?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Ir a mis compras",
            cancelButtonText: "Permanecer en el carrito"
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(["/purchases"])
            }
          })
        })
      })
    } catch (e: any) {
      console.error("Error al procesar la venta:", e)
      Swal.fire({
        icon: "error",
        title: "Oops..",
        text: "Hubo un error al realizar la transacción"
      })
    }
  }
}
