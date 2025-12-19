import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StoreService } from '../../services/store-service';
import { BackButtonComponent } from '../../components/back-button/back-button';
import { CartService } from '../../services/cart-service';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-shipping-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BackButtonComponent],
  templateUrl: './shipping.html',
  styleUrl: './shipping.css'
})
export class ShippingPage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  public storeService = inject(StoreService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);

  shippingForm: FormGroup;
  deliveryType = signal<'delivery' | 'pickup'>('delivery');
  storeAddress = signal<string>('Cargando dirección del local...');

  constructor() {
    this.shippingForm = this.fb.group({
      street: ['', [Validators.required]],
      number: ['', [Validators.required]],
      city: ['', [Validators.required]],
      zip: ['', [Validators.required]],
      notes: ['', [Validators.maxLength(100)]]
    });
  }

  ngOnInit() {
    const user = this.authService.user();
    if (user && user.id) {
      this.cartService.getCart(user.id).subscribe({
        next: (cart) => {
          if (!cart.items || cart.items.length === 0) {
            this.router.navigate(['/cart']);
          }
        },
        error: () => this.router.navigate(['/cart'])
      });
    } else {
      this.router.navigate(['/cart']);
    }

    this.storeService.getStore().subscribe({
      next: (store) => {
        if (store && store.address) {
          this.storeAddress.set(store.address);
        } else {
          this.storeAddress.set('Dirección no disponible');
        }
      },
      error: () => {
        this.storeAddress.set('No se pudo cargar la dirección del local');
      }
    });

    const savedData = localStorage.getItem('shipping_data');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      this.deliveryType.set(parsed.type);
      if (parsed.form) {
        this.shippingForm.patchValue(parsed.form);
      }
    }
  }

  setDeliveryType(type: 'delivery' | 'pickup') {
    this.deliveryType.set(type);
  }

  onSubmit() {
    if (this.deliveryType() === 'delivery' && this.shippingForm.invalid) {
      this.shippingForm.markAllAsTouched();
      return;
    }

    const shippingData = {
      type: this.deliveryType(),
      form: this.deliveryType() === 'delivery' ? this.shippingForm.value : null
    };

    localStorage.setItem('shipping_data', JSON.stringify(shippingData));

    this.router.navigate(['/cart/checkout']);
  }
}
