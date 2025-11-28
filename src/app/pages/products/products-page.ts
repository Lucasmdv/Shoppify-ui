import { Component, ElementRef, ViewChild, ViewEncapsulation, inject } from '@angular/core';
import { Product } from '../../models/product';
import { Category } from '../../models/category';
import { ProductService } from '../../services/product-service';
import { CategoryService } from '../../services/category-service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ProductCard } from '../../components/product-card/product-card';
import { ProductsRefiner } from '../../components/product-refiner/product-refiner';
import { ProductParams } from '../../models/filters/productParams';
import { AuthService } from '../../services/auth-service';
import { SwalService } from '../../services/swal-service';
import { ProductTable } from '../../components/product-table/product-table';
import { MatDialog } from '@angular/material/dialog';
import { ProductFormDialog } from '../../components/product-form-dialog/product-form-dialog';
import { CommonModule } from '@angular/common';
import { Page } from '../../models/hal/page';
import { PaginationModule } from '@coreui/angular';
import { CreateProduct } from '../../services/create-product';
import { ScreenSizeService } from '../../services/screen-size-service';
import { map } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-products-page',
  standalone: true,
  imports: [
    ProductCard,
    ProductsRefiner,
    ProductTable,
    CommonModule,
    PaginationModule
  ],
  templateUrl: './products-page.html',
  styleUrl: './products-page.css',
  encapsulation: ViewEncapsulation.None
})
export class ProductsPage {
  //Paginacion
  productsPage!: Page
  defaultSize:number = 8
  //Arreglos
  refinedProducts: Product[] = [];
  categories: Category[] = [];
  //Filtros
  currentFilters: ProductParams = { page: 0, size: this.defaultSize};
  //Toggles
  editMode = false;
  adminView = false;
 
  screenSizeService = inject(ScreenSizeService);

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    public auth: AuthService,
    private swal: SwalService,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private createProductService: CreateProduct,
  ) { }

  get visiblePages(): number[] {
    if (!this.productsPage) return [];

    const total = this.productsPage.totalPages;
    const current = this.productsPage.number;

    const windowSize = 5;          
    const half = Math.floor(windowSize / 2);

    let start = current - half;
    let end = current + half;

    if (start < 0) {
      end += -start;
      start = 0;
    }

    if (end >= total) {
      start -= (end - total + 1);
      end = total - 1;
    }

    if (start < 0) start = 0;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

  ngOnInit(): void {
    combineLatest([this.route.params, this.route.queryParams]).pipe(
      map(([params, queryParams]) => ({...params, ...queryParams}))
    ).subscribe(allParams => {
      const filters = this.parseFilters(allParams);
      this.currentFilters = filters;
      this.renderRefinedProducts(filters);
      this.renderCategories();
    });
  }

  editToggle(): void {
    this.editMode = !this.editMode;
  }

  viewToggle(): void {
    this.adminView = !this.adminView;
  }

  onFilterChange(filters: ProductParams): void {
    const merged: ProductParams = { page: 0, size: this.defaultSize, ...filters };
    this.currentFilters = merged;
    this.navigateWithFilters(merged);
  }

  renderRefinedProducts(filters: ProductParams): void {
    this.productService.getList(filters).subscribe({
      next: (data) => {
        let items = data.data;
        if (!this.auth.permits().includes('ADMIN')) {
          items = items.filter(p => !p.inactive);
        }
        this.productsPage = data.page;
        this.refinedProducts = items;
      },
      error: (err) => {
        this.swal.error("Ocurrio un error al filtrar los productos")
      }
    });
  }

  renderCategories(): void {
    this.categoryService.getList().subscribe({
      next: (data) => {
        this.categories = data.data;
      },
      error: (err) => {
        console.error('Error al obtener las categorías:', err);
      }
    });
  }

  deleteProduct(id: number): void {
    this.productService.delete(id).subscribe({
      next: () => {
        this.swal.success('Producto eliminado con éxito!');
        this.renderRefinedProducts(this.currentFilters);
      },
      error: (err) => {
        console.error('Error al eliminar el producto en el servidor:', err);
        this.swal.error('No se pudo eliminar el producto en el servidor.');
      }
    });
  }

  hideProduct(product: Product): void {
    const updatedProduct = { ...product, inactive: true };
    this.productService.patch(updatedProduct).subscribe({
      next: () => {
        this.swal.success('El producto ahora se encuentra oculto.');
        this.renderRefinedProducts(this.currentFilters);
      },
      error: (err) => {
        console.error('Error al ocultar el producto:', err);
        this.swal.error('No se pudo ocultar el producto.');
      }
    });
  }

  unhideProduct(product: Product): void {
    const updatedProduct = { ...product, inactive: false };
    this.productService.patch(updatedProduct).subscribe({
      next: () => {
        this.swal.success('Producto ahora visible con éxito.');
        this.renderRefinedProducts(this.currentFilters);
      },
      error: (err) => {
        console.error('Error al mostrar el producto:', err);
        this.swal.error('No se pudo mostrar el producto.');
      }
    });
  }

  onDelete() {
    this.renderRefinedProducts(this.currentFilters);
  }

  editProduct(product: Product): void {
    this.dialog.open(ProductFormDialog, {
      maxWidth: "none",
      width: '80vw',
      height: '90vh',
      data: {
        product: product,
        products: this.refinedProducts, 
        categories: this.categories
      },
      disableClose: true,
      panelClass: 'product-dialog-panel'
    }).afterClosed().subscribe(result => {
      if (result) {
        this.renderRefinedProducts(this.currentFilters); 
      }
    })
  }


  private navigateWithFilters(filters: ProductParams): void {
    const isSearchRoute = this.route.snapshot.paramMap.has('q');

    if (isSearchRoute) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: this.cleanParams(filters)
      });
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { page, size, ...queryParams } = this.cleanParams(filters);
    const pageNumber = Number(page);

    let path: any[];
    if (pageNumber > 0) {
      path = ['/products', 'page', pageNumber];
    } else {
      path = ['/products'];
    }

    this.router.navigate(path, {
      queryParams
    });
  }


  createProduct() {
    if (this.screenSizeService.isScreenSmall()) {
      this.createProductService.setData(this.refinedProducts, this.categories);
      this.router.navigate(['/product-form']);
    } else {
      this.createProductService.openDialog(
        this.refinedProducts,
        this.categories,
        this.currentFilters,
        (filters: any) => this.renderRefinedProducts(filters)
      )
    }
  }

  private parseFilters(params: Params): ProductParams {
    const filters: ProductParams = {
      page: params['page'] ? Number(params['page']) : 0,
      size: params['size'] ? Number(params['size']) : this.defaultSize
    };

    if (params['name']) filters.name = params['name'];
    if (params['brand']) filters.brand = params['brand'];
    if (params['categories']) filters.categories = params['categories'];
    if (params['priceBetween']) filters.priceBetween = params['priceBetween'];
    if (params['priceGreater']) filters.priceGreater = Number(params['priceGreater']);
    if (params['priceLess']) filters.priceLess = Number(params['priceLess']);
    if (params['discountBetween']) filters.discountBetween = params['discountBetween'];
    if (params['discountGreater']) filters.discountGreater = Number(params['discountGreater']);
    if (params['discountLess']) filters.discountLess = Number(params['discountLess']);
    if (params['sort']) filters.sort = params['sort'];

    return filters;
  }

  private cleanParams(filters: ProductParams): Params {
    const query: Params = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query[key] = value;
      }
    });

    return query;
  }


  nextPage() {
    if (this.productsPage && this.productsPage.number < (this.productsPage.totalPages - 1)) {
      this.currentFilters.page = this.productsPage.number + 1;
      this.navigateWithFilters(this.currentFilters);
    }
  }

  prevPage() {
    if (this.productsPage && this.productsPage.number > 0) {
      this.currentFilters.page = this.productsPage.number - 1;
      this.navigateWithFilters(this.currentFilters);
    }
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.productsPage.totalPages) {
      this.currentFilters.page = page;
      this.navigateWithFilters(this.currentFilters);
    }
  }


  get pagesArray(): number[] {
    if (!this.productsPage) {
      return [];
    }
    return Array(this.productsPage.totalPages).fill(0).map((x,i) => i);
  }

  get totalResults():number{
  if(!this.productsPage){
    return 0
  }
  return this.productsPage.totalElements;
  }
}
