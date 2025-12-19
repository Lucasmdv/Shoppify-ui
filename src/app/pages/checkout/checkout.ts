import { Component, inject, viewChild, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { StoreService } from '../../services/store-service';
import { CartService } from '../../services/cart-service';
import { DetailCart } from '../../models/cart/cartResponse';
import { CommonModule } from '@angular/common';
import { MercadopagoButton } from '../../components/mercadopago-button/mercadopago-button';
import { BackButtonComponent } from '../../components/back-button/back-button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, MercadopagoButton, BackButtonComponent],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  private router = inject(Router);
  private aService = inject(AuthService);
  public cService = inject(CartService);
  private mpButton = viewChild(MercadopagoButton);

  total: number = 0;
  items: DetailCart[] = [];

  private storeService = inject(StoreService);

  shippingCost: number = 0;
  storeConfig: any = null;

  ngOnInit(): void {
    if (!localStorage.getItem('shipping_data')) {
      this.router.navigate(['/cart']);
      return;
    }

    const userId = this.aService.user()?.id;
    if (!userId) {
      this.router.navigate(['/cart']);
      return;
    }

    this.cService.getCart(userId).subscribe({
      next: (cart) => {
        const selectedIds = this.cService.selected();
        this.items = cart.items.filter(item => selectedIds.has(item.id!));

        if (this.items.length === 0) {
          this.router.navigate(['/cart']);
          return;
        }

        this.total = this.items.reduce((acc, item) => acc + (item.subtotal || 0), 0);
        this.fetchStoreAndCalculateShipping();
      },
      error: (err) => {
        console.error(err);
        this.router.navigate(['/cart']);
      },
    });
  }

  fetchStoreAndCalculateShipping() {
    this.storeService.getStore().subscribe(store => {
      this.storeConfig = store;
      this.calculateShipping();
    });
  }

  calculateShipping() {
    if (!this.storeConfig) return;

    const shippingDataJson = localStorage.getItem('shipping_data');
    if (shippingDataJson) {
      const shippingData = JSON.parse(shippingDataJson);
      if (shippingData.type === 'pickup') {
        this.shippingCost = 0;
        return;
      }
    }

    const quantity = this.items.reduce((acc, item) => acc + (item.quantity || 0), 0);

    if (quantity <= 4) {
      this.shippingCost = this.storeConfig.shippingCostSmall || 0;
    } else if (quantity <= 6) {
      this.shippingCost = this.storeConfig.shippingCostMedium || 0;
    } else {
      this.shippingCost = this.storeConfig.shippingCostLarge || 0;
    }
  }

  get finalTotal(): number {
    return this.total + this.shippingCost;
  }

  checkAndCancelTransaction() {
    this.mpButton()?.checkAndCancelTransaction();
  }
}
