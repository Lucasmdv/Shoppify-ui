import { Component } from '@angular/core';
import { ProductForm } from '../../components/product-form/product-form';
import { BackButtonComponent } from '../../components/back-button/back-button';

@Component({
  selector: 'app-product-form-page',
  standalone: true,
  imports: [ProductForm, BackButtonComponent],
  template: `
    <app-back-button></app-back-button>
    <app-product-form></app-product-form>
  `,
  styles: [`
    app-back-button {
      margin: 20px;
      display: block;
    }
  `]
})
export class ProductFormPage { }
