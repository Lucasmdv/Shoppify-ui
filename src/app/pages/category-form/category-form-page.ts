import { Component } from '@angular/core';
import { CategoryForm } from '../../components/category-form/category-form';
import { BackButtonComponent } from '../../components/back-button/back-button';

@Component({
  selector: 'app-category-form-page',
  standalone: true,
  imports: [CategoryForm, BackButtonComponent],
  templateUrl: './category-form-page.html',
  styles: [`
    app-back-button {
      margin: 20px;
      display: block;
    }
  `]
})
export class CategoryFormPage { }
