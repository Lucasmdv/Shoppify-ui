import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CategoryFormDialog } from '../components/category-form-dialog/category-form-dialog';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class CreateCategory {
  categories: Category[] = []
  category?: Category

  constructor(
    private dialog: MatDialog,
  ) { }

  setData(categories: Category[], category?: Category) {
    this.categories = categories
    this.category = category
  }

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
