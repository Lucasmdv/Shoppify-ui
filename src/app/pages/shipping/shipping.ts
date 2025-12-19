import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StoreService } from '../../services/store-service';
import { BackButtonComponent } from '../../components/back-button/back-button';

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

  shippingForm: FormGroup;
  deliveryType = signal<'delivery' | 'pickup'>('delivery');
  storeAddress = signal<string>('Cargando dirección del local...');

  constructor() {
    this.shippingForm = this.fb.group({
      street: [''],
      number: [''],
      city: [''],
      zip: [''],
      notes: ['', [Validators.maxLength(100)]]
    });

    this.applyDeliveryValidators(true);
  }

  ngOnInit() {
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
      this.setDeliveryType(parsed.type);
      if (parsed.form) {
        this.shippingForm.patchValue(parsed.form);
      }
    }
  }

  setDeliveryType(type: 'delivery' | 'pickup') {
    this.deliveryType.set(type);
    this.applyDeliveryValidators(type === 'delivery');
  }

  private applyDeliveryValidators(isDelivery: boolean) {
    const street = this.shippingForm.get('street');
    const number = this.shippingForm.get('number');
    const city = this.shippingForm.get('city');
    const zip = this.shippingForm.get('zip');

    if (isDelivery) {
      street?.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(120)]);
      number?.setValidators([Validators.required, Validators.pattern(/^\d+$/), Validators.min(1)]);
      city?.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(100)]);
      zip?.setValidators([Validators.required, Validators.pattern(/^\d+$/), Validators.min(1)]);
    } else {
      street?.clearValidators();
      number?.clearValidators();
      city?.clearValidators();
      zip?.clearValidators();
    }

    street?.updateValueAndValidity();
    number?.updateValueAndValidity();
    city?.updateValueAndValidity();
    zip?.updateValueAndValidity();
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
