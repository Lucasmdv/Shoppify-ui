import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Product } from '../../models/product';
import { Category } from '../../models/category';
import { ProductForm } from '../product-form/product-form';

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [ProductForm],
  templateUrl: './product-form-dialog.html',
  styleUrl: './product-form-dialog.css'
})
export class ProductFormDialog {
  constructor(
    private dialog: MatDialogRef<ProductFormDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {
      product?: Product;
      products: Product[];
      categories: Category[];
    }
  ) { }

  close(product: Product | void) {
    this.dialog.close(product)
  }
}