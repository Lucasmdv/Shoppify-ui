import { Injectable, signal } from '@angular/core';
import { Cart } from '../models/cart/cartResponse';
import { CartService } from './cart-service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartSignal {
  cartSignal = signal<Cart | null>(null)

  constructor(private cartService: CartService) {}

  async addItem(userId: number, productId: number, quantity: number): Promise<Cart> {
    return firstValueFrom(this.cartService.addItem(userId, productId, quantity))
      .then(cart => { this.cartSignal.set(cart); return cart; })
      .catch(err => { console.error(err); throw err; })
  }

  async removeItem(userId: number, itemId: number): Promise<Cart> {
    return firstValueFrom(this.cartService.removeItem(userId, itemId))
      .then(cart => { this.cartSignal.set(cart); return cart; })
      .catch(err => { console.error(err); throw err; })
  }

  async updateItemQuantity(userId: number, itemId: number, quantity: number): Promise<Cart> {
    return firstValueFrom(this.cartService.updateItemQuantity(userId, itemId, quantity))
      .then(cart => { this.cartSignal.set(cart); return cart })
      .catch(err => { console.error(err); throw err })
  }

  async syncCart(userId: number): Promise<Cart | null> {
    return firstValueFrom(this.cartService.getCart(userId))
      .then(cart => { this.cartSignal.set(cart); return cart; })
      .catch(err => { this.cartSignal.set(null); return null; })
  }

}
