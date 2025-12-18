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
@Component({
  selector: 'app-cart-page',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './cart-page.html',
  styleUrl: './cart-page.css'
})
export class CartPage implements OnInit {

  private aService = inject(AuthService)
  private fb = inject(FormBuilder)
  public cService = inject(CartService)
  public router = inject(Router)
  private tService = inject(TransactionService)

  checkoutForm!: FormGroup
  permits = this.aService.permits()
  items: DetailCart[] = []
  

  ngOnInit(): void {

    this.cartItems().subscribe({
      next: cart => {
        this.items = cart.items;
        this.cService.selected.set(new Set(this.items.map(item => item.id!)));
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
    const selected = this.cService.selected()
    return this.items.reduce((sum, item) => {
      if (selected.has(item.id!)) sum += item.subtotal || 0
      return sum
    }, 0)
  }

  get total(): number {
    return this.selectedTotal();
  }

  toggleSelection(id: number, checked: boolean) {
    this.cService.selected.update(selected => {
      const updated = new Set(selected);
      if (checked) updated.add(id);
      else updated.delete(id);
      return updated;
    });
  }

  toggleAll() {
    const isAllSelected = this.items.length > 0 && this.cService.selected().size === this.items.length;

    if (isAllSelected) {
      this.cService.selected.set(new Set());
    } else {
      const allIds = this.items.map(item => item.id!);
      this.cService.selected.set(new Set(allIds));
    }
  }

  get allSelected(): boolean {
    return this.items.length > 0 && this.cService.selected().size === this.items.length;
  }

  removeFromCart(id: number) {
    this.cService.removeItem(this.aService.user()!.id!, id).subscribe({
      next: () => {
        this.items = this.items.filter(item => item.id !== id)
        this.cService.selected.update(selected => {
          const updated = new Set(selected);
          updated.delete(id);
          return updated;
        });
      }
    })
  }

  removeSelected() {
    this.cService.removeSelected(this.aService.user()!.id!).subscribe({
      next: () => {
        this.cService.getCart(this.aService.user()!.id!).subscribe(cart => {
            this.items = cart.items;
        });
      }
    })
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

  
}
