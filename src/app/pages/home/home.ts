import { Component, HostListener, OnInit } from '@angular/core';
import { ProductService } from '../../services/product-service';
import { Product } from '../../models/product';
import { ProductCard } from "../../components/product-card/product-card";
import { CategoryService } from '../../services/category-service';
import { Category } from '../../models/category';
import { CategoryCard } from "../../components/category-card/category-card";
import { RouterLink } from '@angular/router';
import { globalParams } from '../../models/filters/globalParams';
import { PromotionCarousel } from "../../components/promotion-carousel/promotion-carousel";
import { CarouselService } from '../../services/carousel-service';
import { Carouselitem } from '../../models/carouselitem';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ProductCard,
    CategoryCard,
    RouterLink,
    PromotionCarousel
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  products: Product[] = [];
  categories: Category[] = [];
  carouselItems: Carouselitem[] = [];

  private allProductsData: Product[] = [];
  private allCategoriesData: Category[] = [];
  private productLimit = 0;
  private categoryLimit = 0;

  productParams: globalParams = {
    page: 0,
    size: 20, // pedimos suficiente; el front recorta segun viewport
  };

  categoryParams: globalParams = {
    page: 0,
    size: 20, // pedimos suficiente; el front recorta segun viewport
  };

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    private carouselService: CarouselService
  ) {}

  ngOnInit(): void {
    this.updateGridConfig();
    this.renderProducts();
    this.renderCategories();
    this.renderCarousel();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateGridConfig();
    this.applySliceToProducts();
    this.applySliceToCategories();
  }

  renderProducts(): void {
    this.productService.getList(this.productParams).subscribe({
      next: (products) => {
        this.allProductsData = products.data;
        this.applySliceToProducts();
      },
      error: (err) => console.error(err)
    });
  }

  renderCategories(): void {
    this.categoryService.getList(this.categoryParams).subscribe({
      next: (categories) => {
        this.allCategoriesData = categories.data;
        this.applySliceToCategories();
      },
      error: (err) => console.error(err)
    });
  }

  renderCarousel(): void {
    this.carouselService.getCarousel().subscribe({
      next: (carousel) => {
        this.carouselItems = carousel;
      },
      error: (err) => console.error(err)
    });
  }

  private applySliceToProducts(): void {
    if (!this.allProductsData.length) return;
    this.products = this.productLimit ? this.allProductsData.slice(0, this.productLimit) : this.allProductsData;
  }

  private applySliceToCategories(): void {
    if (!this.allCategoriesData.length) return;
    this.categories = this.categoryLimit ? this.allCategoriesData.slice(0, this.categoryLimit) : this.allCategoriesData;
  }

  private updateGridConfig(): void {
    const width = typeof window !== 'undefined' ? window.innerWidth : 1200;

    if (width < 700) {
      this.productLimit = 4;
      this.categoryLimit = 4;
         } else if (width < 769) {
      this.productLimit = 6;
      this.categoryLimit = 4;
    } else if (width < 993) {
      this.productLimit = 6;
      this.categoryLimit = 3;
    } else if (width < 1200) {
      this.productLimit = 8;
      this.categoryLimit = 4;
    } else if (width < 1300) {
      this.productLimit = 10;
      this.categoryLimit = 5;
    } else {
      this.productLimit = 10;
      this.categoryLimit = 5;
    }
  }
}
