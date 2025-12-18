import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Category } from '../../models/category';
import { CategoryService } from '../../services/category-service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CategoryCard } from '../../components/category-card/category-card';
import { CategoryForm } from '../../components/category-form/category-form';
import { CategoryRefiner } from '../../components/category-refiner/category-refiner';
import { CategoryParams } from '../../models/filters/category-params';
import { SwalService } from '../../services/swal-service';
import { MatDialog } from '@angular/material/dialog';
import { CategoryFormDialog } from '../../components/category-form-dialog/category-form-dialog';
import { AuthService } from '../../services/auth-service';
import { CommonModule } from '@angular/common';
import { CreateCategory } from '../../services/create-category';
import { ScreenSizeService } from '../../services/screen-size-service';

@Component({
  selector: 'app-categories-page',
  imports: [CategoryCard, CategoryRefiner, CommonModule],
  templateUrl: './categories-page.html',
  styleUrl: './categories-page.css',
})
export class CategoriesPage implements OnInit {
  categories: Category[] = []

  currentFilters: CategoryParams = { page: 0, size: 8 }
  editMode = false;

  constructor(
    public auth: AuthService,
    private categoryService: CategoryService,
    private swal: SwalService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private createCategoryService: CreateCategory,
    private screenSizeService: ScreenSizeService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const filters = this.parseFilters(params);
      this.currentFilters = filters;
      this.renderCategoriesWithFilters(filters);
    })
  }

  editToggle(): void {
    this.editMode = !this.editMode;
  }

  onFilterChange(filters: CategoryParams): void {

    const merged: CategoryParams = { page: 0, size: 6, ...filters };
    this.currentFilters = merged;
    this.navigateWithFilters(merged);
  }


  renderCategoriesWithFilters(filters: CategoryParams): void {
    this.categoryService.getList(filters).subscribe({
      next: (data) => {
        this.categories = data.data;
      },
      error: (err) => {
        console.error("Ocurrió un error al buscar/filtrar las categorías");
      }
    });
  }

  deleteCategory(id: number): void {
    this.categoryService.delete(id).subscribe({
      next: () => {
        this.swal.success('Categoria eliminada con éxito!')
        this.renderCategoriesWithFilters(this.currentFilters);
      },
      error: () => {
        this.swal.error('Error al eliminar la categoria')
      }
    });
  }

  onDelete() {
    this.renderCategoriesWithFilters(this.currentFilters)
  }

  editCategory(category: Category): void {
    if (this.screenSizeService.isScreenSmall()) {
      this.createCategoryService.setData(this.categories, category);
      this.router.navigate(['/category-form']);
    } else {
    this.dialog.open(CategoryFormDialog, {
      maxWidth: "none",
      width: '80vw',
      data: {
        category: category,
      },
      disableClose: true,
      panelClass: 'category-dialog-panel'
    }).afterClosed().subscribe(result => {
      if (result) {
        this.swal.success("La categoría se editó correctamente!")
        this.renderCategoriesWithFilters(this.currentFilters)
        }
      })
    }
  }


  private navigateWithFilters(filters: CategoryParams): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.cleanParams(filters)
    });
  }


  createCategory() {
    if (this.screenSizeService.isScreenSmall()) {
      this.router.navigate(['/category-form'])
    } else {
      this.createCategoryService.openDialog().afterClosed().subscribe(result => {
        if (result) {
          this.renderCategoriesWithFilters(this.currentFilters)
        }
      })
    }
  }

  private parseFilters(params: Params): CategoryParams {
    const filters: CategoryParams = {
      page: params['page'] ? Number(params['page']) : 0,
      size: params['size'] ? Number(params['size']) : 6
    };
    if (params['name']) filters.name = params['name'];
    if (params['sort']) filters.sort = params['sort'];
    return filters;
  }

  private cleanParams(filters: CategoryParams): Params {
    const query: Params = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query[key] = value;
      }
    });
    return query;
  }
}