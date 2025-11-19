import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CategoryForm } from '../../components/category-form/category-form';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category-service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-category-page',
  imports: [CategoryForm],
  templateUrl: './edit-category-page.html',
  styleUrl: './edit-category-page.css'
})
export class EditCategoryPage implements OnInit {
  categories: Category[] = []

  constructor(private categoryService: CategoryService, private router: Router) { }

  ngOnInit(): void {
    this.getCategories()
  }

  getCategories() {
    this.categoryService.getList().subscribe({
      next: data => this.categories = data.data,
      error: () => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Ocurrio un problema al obtener las categorias",
          confirmButtonText: "Volver",
          confirmButtonColor: "#ff7543"
        }).then((res) => {
          if(res.isConfirmed) {
            this.router.navigate(["/categories"])
          }
        })
      }
    })
  }

  getBack() {
    this.router.navigate(['/categories'])
  }
}