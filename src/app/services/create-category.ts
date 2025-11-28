import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CategoryFormDialog } from '../components/category-form-dialog/category-form-dialog';

@Injectable({
  providedIn: 'root'
})
export class CreateCategory {

  constructor(
    private dialog: MatDialog,
  ) { }

  openDialog() {
    return this.dialog.open(CategoryFormDialog, {
      maxWidth: "none",
      width: '75vw',
      data: {
      },
      disableClose: true,
      panelClass: 'category-dialog-panel'
    })
  }
}
