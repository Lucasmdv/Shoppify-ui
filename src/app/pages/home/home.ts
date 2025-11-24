import { Component, Input, OnInit, Query } from '@angular/core';
import { ProductService } from '../../services/product-service';
import { Product } from '../../models/product';
import { ProductCard } from "../../components/product-card/product-card";
import { CategoryService } from '../../services/category-service';
import { Category } from '../../models/category';
import { StoreService } from '../../services/store-service';
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
  categories:Category[] = [];
  carouselItems:Carouselitem[] = [];
  params : globalParams = {
      page:0,
      size:6,
    }
  

  constructor(private productService:ProductService, private categoryService:CategoryService, private storeService:StoreService, private carouselService:CarouselService) {

  }

  ngOnInit(): void {
    this.renderProducts();
    this.renderCategories();
    this.renderCarousel();
  }

  renderProducts(): void {   
    this.productService.getList(this.params).subscribe({
      next: (products) => {
        this.products = products.data;
    
      },
      error: (err) => {
        console.error('Error al obtener todos los productos:', err);
      }
    });
  }

    renderCarousel(): void {   
    this.carouselService.getCarousel().subscribe({
      next: (carousel) => {
        this.carouselItems = carousel
    
      },
      error: (err) => {
        console.error('Error al obtener todos los productos:', err);
      }
    });
  }


    renderCategories(): void {
    this.categoryService.getList(this.params).subscribe({
      next: (categories) => {
        this.categories = categories.data;
      },
      error: (err) => {
        console.error('Error al obtener todas las categorias:', err);
      }
    });
  }


}
