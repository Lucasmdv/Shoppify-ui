import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Cart } from '../models/cart/cartResponse';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private http = inject(HttpClient);

  readonly API_URL = `${environment.apiUrl}/user`;

  getCart(userId: number) {
    return this.http.get<Cart>(`${this.API_URL}/${userId}/cart`);
  }

  clearCart(userId: number) {
    return this.http.delete<Cart>(`${this.API_URL}/${userId}/cart/items`);
  }

  addItem(userId: number, productId: number, quantity: number) {
    const cartRequest = { productId, quantity };
    return this.http.post<Cart>(`${this.API_URL}/${userId}/cart/items`, cartRequest);
  }

  removeItem(userId: number, itemId: number) {
    return this.http.delete<Cart>(`${this.API_URL}/${userId}/cart/items/${itemId}`);
  }

  updateItemQuantity(userId: number, itemId: number, quantity: number) {
    return this.http.patch<Cart>(`${this.API_URL}/${userId}/cart/items/${itemId}`, { quantity });
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
