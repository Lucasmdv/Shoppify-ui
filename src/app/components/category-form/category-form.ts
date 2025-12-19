import { Component, Input, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category-service';
import { SwalService } from '../../services/swal-service';
import { CommonModule } from '@angular/common';
import { CategoryCard } from '../category-card/category-card';
import { MatDialogRef } from '@angular/material/dialog';
import { CreateCategory } from '../../services/create-category';

@Component({
  selector: 'app-category-form',
  imports: [ReactiveFormsModule, CommonModule, CategoryCard], 
  templateUrl: './category-form.html',
  styleUrl: './category-form.css'
})
export class CategoryForm implements OnInit {
  @Input() category?: Category
  
  form!: FormGroup
  previewCategory!: Category 

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private swal: SwalService,
    private createCategoryService: CreateCategory,
    @Optional() private dialogRef?: MatDialogRef<any>
  ) {}

  get controls() {
    return this.form.controls
  }

  private updatePreview(): void {
    if (!this.form) {
      this.previewCategory = {
        id: this.category?.id ?? 0,
        name: this.category?.name ?? 'Categoria sin nombre',
        imgUrl: this.category?.imgUrl ?? ''
      };
      return;
    }

    const values = this.form.value;
    this.previewCategory = {
      id: Number(values['id'] ?? this.category?.id ?? 0),
      name: values['name'] || 'Producto sin nombre',
      imgUrl: values['imgUrl'] || ''
    };
  }

  ngOnInit(): void {
    if (!this.category) {
      this.category = this.createCategoryService.category
    }

    this.form = this.fb.group({
      id: [this.category?.id || ''], 
      name: [this.category?.name || '', [Validators.required, Validators.pattern(/\S/), Validators.minLength(2), Validators.maxLength(50)]],
      imgUrl: [this.category?.imgUrl || '', Validators.maxLength(200)]
    })
    this.updatePreview()
    this.form.valueChanges.subscribe(() => this.updatePreview())

    if (this.category) {
      this.form.markAllAsDirty()
    } else {
      this.form.controls['id'].setValue(undefined) 
    }

  }

  submitForm() {
    if (this.form.invalid) { 
      this.form.markAllAsDirty()
      return;
    }

    const formValues = this.form.value;
    const editMode = !!this.category 

    const request = editMode
      ? this.categoryService.patch(formValues)
      : this.categoryService.post(formValues)

    request.subscribe({
      next: () => {
        this.swal.success(editMode ? "Categoría editada con éxito!" : "Categoría agregada con éxito!")
          .then(() => {
            this.form.reset();
          })
          this.dialogRef?.close(true)
      },
      error: (err) => {
        const defaultMessage = editMode ? "Error al editar la categoría" : "Error al agregar la categoría";
        const errorMessage = err.error?.message || defaultMessage; 
        this.swal.error(errorMessage)
      }
    })
  }
}
