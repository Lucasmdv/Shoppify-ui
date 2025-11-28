import { Component } from '@angular/core';
import { ProductForm } from '../../components/product-form/product-form';

@Component({
  selector: 'app-product-form-page',
  standalone: true,
  imports: [ProductForm],
  template: '<app-product-form></app-product-form>',
})
export class ProductFormPage {}
