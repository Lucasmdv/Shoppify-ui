import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProductFormDialog } from '../components/product-form-dialog/product-form-dialog';
import { Product } from '../models/product';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class CreateProduct {
  products: Product[] = []
  categories: Category[] = []
  product: Product | undefined

  constructor(
    private dialog: MatDialog,
  ) {
    dialog
  }

  setData(products: Product[], categories: Category[], product?: Product) {
    this.products = products
    this.categories = categories
    this.product = product
  }

  openDialog(refinedProducts: any[], categories: any[], currentFilters: any, renderRefinedProducts: (filters: any) => void) {
    this.dialog.open(ProductFormDialog, {
      height: '90vh',
      minWidth: '90vw',
      data: {
        products: refinedProducts,
        categories: categories
      },
      disableClose: true,
      panelClass: 'product-dialog-panel'
    })
  }
}
