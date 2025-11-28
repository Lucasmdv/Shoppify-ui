import { Component } from '@angular/core';
import { CategoryForm } from '../../components/category-form/category-form';

@Component({
  selector: 'app-category-form-page',
  standalone: true,
  imports: [CategoryForm],
  templateUrl: './category-form-page.html',
})
export class CategoryFormPage {}
