import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product';
import { ProductService } from './product-service';
import Swal from 'sweetalert2';
import { SaleRequest } from '../models/sale';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  cartItems = signal<Product[]>([])
  itemsInCart = computed(() => this.cartItems().length)

  total = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.priceWithDiscount! * item.stock, 0)
  )

  constructor(private productService: ProductService) { }


  addToCart(product: Product) {
    this.productService.get(product.id).subscribe({
      next: updatedProduct => {
        if (updatedProduct.stock > 0) {
          const items = [...this.cartItems()];
          const existing = items.find(i => i.id === product.id)

          if (existing) {
            if (updatedProduct.stock > existing.stock) {
              existing.stock++
            } else {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "El producto no tiene stock disponible"
              });
            }
          } else {
            items.push({ ...product, stock: 1 })
          }

          this.cartItems.set(items)
        } else {
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "El producto no tiene stock disponible"
          });
        }
      },
      error: err => console.error('Error verificando stock:', err)
    })
  }

  updateQuantity(item: Product, newQty: number): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      const quantity = Number(newQty)

      if (quantity < 1) {
        reject(new Error("La cantidad mínima es 1"))
        return
      }

      this.productService.get(item.id).subscribe({
        next: (updatedProduct) => {
          if (quantity > updatedProduct.stock) {
            reject(new Error("Solo hay " + updatedProduct.stock + " unidades disponibles"))
          } else {
            const updatedCart = this.cartItems().map((i) =>
              i.id === item.id ? { ...i, stock: quantity } : i
            )
            this.cartItems.set(updatedCart)
            resolve(updatedCart)
          }
        },
        error: (err) => {
          console.error("Error verificando stock:", err)
          reject(new Error("No se pudo verificar el stock del producto"))
        },
      })
    })
  }

  removeFromCart(productId: number) {
    this.cartItems.set(this.cartItems().filter(i => i.id !== productId))
  }

  removeItemsByIds(productIds: number[]) {
    const idsToRemove = new Set(productIds)
    this.cartItems.update(items => items.filter(i => !idsToRemove.has(i.id)))
  }

  clearCart() {
    this.cartItems.set([])
  }

  prepareSaleRequest(formValue: any, userId: number | undefined, products: Product[]): SaleRequest | null {
    if (!userId) {
      console.error('❌ No hay usuario logueado. No se puede preparar la venta.');
      return null;
    }

    if (!products || !products.length) {
      console.warn('⚠️ No hay productos para la venta.');
      return null;
    }

    const detailTransactions = products.map(item => ({
      productID: item.id,
      quantity: item.stock
    }))

    return {
      userId,
      transaction: {
        paymentMethod: formValue.paymentMethod || "CASH",
        detailTransactions,
        description: formValue.description || "Sin descripción"
      }
    }
  }
}
