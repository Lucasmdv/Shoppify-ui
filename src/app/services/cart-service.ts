import { inject, Injectable, signal, computed } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Cart, DetailCart } from '../models/cart/cartResponse';
import { SaleRequest } from '../models/sale';
import { tap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { TransactionService } from './transaction-service';
import { ShipmentRequest } from '../models/shipment';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private http = inject(HttpClient);
  private tService = inject(TransactionService);
  readonly API_URL = `${environment.apiUrl}/user`;

  private _cartState = signal<Cart | null>(null);
  public selected = signal<Set<number>>(new Set());

  // Stores the active MP preference and associated Transaction ID
  public activeTransaction = signal<{ preferenceId: string, transactionId: number } | null>(null);

  public setActiveTransaction(data: { preferenceId: string, transactionId: number } | null) {
    this.activeTransaction.set(data);
  }

  public cart = this._cartState.asReadonly();

  public totalItems = computed(() => {
    const currentCart = this._cartState();
    if (!currentCart || !currentCart.items) return 0;
    return currentCart.items.reduce((acc, item) => acc + item.quantity!, 0);
  });


  public totalPrice = computed(() => {
    const currentCart = this._cartState();
    return currentCart?.total || 0;
  });

  private checkAndCancelTransaction() {
    if (this.activeTransaction()) {
      this.cancelActiveTransaction();
    }
  }

  public cancelActiveTransaction() {
    const active = this.activeTransaction();
    if (active) {
      console.log('Cancelling active transaction:', active.transactionId);
      this.tService.cancelTransaction(active.transactionId).subscribe({
        next: () => console.log('Transaction cancelled successfully'),
        error: (err) => console.error('Error cancelling transaction', err)
      });
      this.activeTransaction.set(null);
    }
  }

  getCart(userId: number) {
    return this.http.get<Cart>(`${this.API_URL}/${userId}/cart`).pipe(
      tap(cartData => this._cartState.set(cartData))
    );
  }

  clearCart(userId: number) {
    this.checkAndCancelTransaction();
    return this.http.delete<Cart>(`${this.API_URL}/${userId}/cart/items`).pipe(
      tap(emptyCart => this._cartState.set(emptyCart))
    );
  }

  addItem(userId: number, productId: number, quantity: number) {
    this.checkAndCancelTransaction();
    const cartRequest = { productId, quantity };
    return this.http.post<Cart>(`${this.API_URL}/${userId}/cart/items`, cartRequest).pipe(
      tap(updatedCart => this._cartState.set(updatedCart))
    );
  }

  removeItem(userId: number, itemId: number) {
    this.checkAndCancelTransaction();
    return this.http.delete<Cart>(`${this.API_URL}/${userId}/cart/items/${itemId}`).pipe(
      tap(updatedCart => this._cartState.set(updatedCart))
    );
  }

  updateItemQuantity(userId: number, itemId: number, quantity: number) {
    this.checkAndCancelTransaction();
    return this.http.patch<Cart>(`${this.API_URL}/${userId}/cart/items/${itemId}`, { quantity }).pipe(
      tap(updatedCart => this._cartState.set(updatedCart))
    );
  }

  removeSelected(userId: number) {
    this.checkAndCancelTransaction();
    const selectedIds = this.selected();
    const deleteRequests = Array.from(selectedIds).map(id => this.removeItem(userId, id));
    return forkJoin(deleteRequests).pipe(
      tap(() => this.selected.set(new Set()))
    );
  }

  prepareSaleRequest(userId: number, items: DetailCart[], shipment: ShipmentRequest): SaleRequest | null {
    if (!items || items.length === 0) return null;

    const detailTransactions = items
      .filter(i => i.product?.id !== undefined)
      .map(i => ({
        productID: i.product!.id!,
        quantity: i.quantity || 1
      }));

    if (detailTransactions.length === 0) return null;

    return {
      userId,
      transaction: {
        detailTransactions,
        description: 'Mercado Pago checkout'
      },
      shipment: shipment
    };
  }
}
