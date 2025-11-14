import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SwalService } from './swal-service';
import { CategoryFormDialog } from '../components/category-form-dialog/category-form-dialog';

@Injectable({
  providedIn: 'root'
})
export class CreateCategory {

  constructor(
    private dialog: MatDialog,
    private swal: SwalService
  ) {
    dialog
  }
  

  openDialog(renderCategoriesWithFilters: (filters: any) => void, currentFilters: any) {
    this.dialog.open(CategoryFormDialog, {
          maxWidth: "none",
          width: '75vw',
          data: {
          },
          disableClose: true,
          panelClass: 'category-dialog-panel'
        }).afterClosed().subscribe(result => {
          if (result) {
            this.swal.success("La categoría se agregó correctamente!")
            renderCategoriesWithFilters(currentFilters) 
          }
        })
  }
}
