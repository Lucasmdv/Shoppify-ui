import { inject, Injectable, signal, computed } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Cart } from '../models/cart/cartResponse';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private http = inject(HttpClient);
  readonly API_URL = `${environment.apiUrl}/user`;

  private _cartState = signal<Cart | null>(null);


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



  getCart(userId: number) {
    return this.http.get<Cart>(`${this.API_URL}/${userId}/cart`).pipe(
      tap(cartData => this._cartState.set(cartData)) 
    );
  }

  clearCart(userId: number) {
    return this.http.delete<Cart>(`${this.API_URL}/${userId}/cart/items`).pipe(
      tap(emptyCart => this._cartState.set(emptyCart))
    );
  }

  addItem(userId: number, productId: number, quantity: number) {
    const cartRequest = { productId, quantity };
    return this.http.post<Cart>(`${this.API_URL}/${userId}/cart/items`, cartRequest).pipe(
      tap(updatedCart => this._cartState.set(updatedCart)) 
    );
  }

  removeItem(userId: number, itemId: number) {
    return this.http.delete<Cart>(`${this.API_URL}/${userId}/cart/items/${itemId}`).pipe(
      tap(updatedCart => this._cartState.set(updatedCart))
    );
  }

  updateItemQuantity(userId: number, itemId: number, quantity: number) {
    return this.http.patch<Cart>(`${this.API_URL}/${userId}/cart/items/${itemId}`, { quantity }).pipe(
      tap(updatedCart => this._cartState.set(updatedCart))
    );
  }


  prepareSaleRequest(formValue: any, userId: number, items: any[]): any {
    if (!items || items.length === 0) return null;

    const detailTransactions = items.map(i => ({
      productID: i.product?.id ?? i.productId ?? i.id,
      quantity: i.quantity || 1
    }));

    return {
      clientId: userId,
      transaction: {
        paymentMethod: formValue.paymentMethod || 'CASH',
        detailTransactions,
        description: formValue.description || ''
      }
    };
  }
}