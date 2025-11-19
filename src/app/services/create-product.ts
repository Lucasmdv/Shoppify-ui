import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SwalService } from './swal-service';
import { ProductFormDialog } from '../components/product-form-dialog/product-form-dialog';

@Injectable({
  providedIn: 'root'
})
export class CreateProduct {

  constructor(
    private dialog: MatDialog,
    private swal: SwalService
  ) {
    dialog
  }

  openDialog(refinedProducts: any[], categories: any[], currentFilters: any, renderRefinedProducts: (filters: any) => void) {
    this.dialog.open(ProductFormDialog, {
      height: '90vh',
      minWidth: '80vw',
      data: {
        products: refinedProducts,
        categories: categories
      },
      disableClose: true,
      panelClass: 'product-dialog-panel'
    }).afterClosed().subscribe(result => {
      if (result) {
        this.swal.success("El producto se agrego correctamente!")
        renderRefinedProducts(currentFilters)
      }
    })
  }
}
