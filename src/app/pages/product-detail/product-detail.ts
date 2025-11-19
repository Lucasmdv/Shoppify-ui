import { Component, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../services/product-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart-service';
import { ProductCard } from '../../components/product-card/product-card';
import Swal from 'sweetalert2';
import { StorageService } from '../../services/storage-service';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-product-detail',
  imports: [ProductCard, DecimalPipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {

  product!: Product;
  id?: number;
  relatedProducts: Product[] = [];
  isHidden: boolean = false;

  constructor(
    private pService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private localStorage: StorageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe({
      next: (params) => {
        const idParam = params.get('id');
        const parsedId = idParam ? Number(idParam) : NaN;

        if (!idParam || Number.isNaN(parsedId)) {
          this.router.navigate(['/']);
          return;
        }

        this.id = parsedId;
        this.renderProduct(parsedId);
        this.loadRelatedProducts();
      },
      error: () => this.router.navigate(['/'])
    });

    this.localStorage.getHiddenProductIds();
    this.isHidden = this.localStorage.getHiddenProductIds().includes(this.id || -1);
  }

  renderProduct(id: number){
    this.pService.get(id).subscribe({
      next: prod => {
        this.product = prod;
      },
      error:(e) =>{
        console.log(e);
        this.router.navigate(['/']);
      }
    })
  }

  loadRelatedProducts(): void {
    this.pService.getList({ page: 0, size: 8 }).subscribe({
      next: products => {
        //FIX WITH PROPER FILTERS.
      },
      error: (e) => {
        console.error('Error loading related products:', e);
      }
    });
  }

  onAddToCart(): void {
    if (!this.product) return;
    if (!this.authService.isLogged){
      return
    }else{
      
    this.cartService.addToCart(this.product)
    this.showCartSuccessToast(this.product.name)
    }
  }

  onBuyNow(): void {
    if (!this.product) return;
    if (!this.authService.isLogged){
       return
    }else {
    this.cartService.addToCart(this.product);
    this.router.navigate(['/cart']);
    }
  }

  showCartSuccessToast = (productName: string) => {
  Swal.fire({

    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    
    timer: 1500,
    timerProgressBar: true,
    
    icon: 'success',
    title: `"${productName}" agregado.`,
    customClass: {
        popup: 'swal2-toast-dark'
    }
  })
  }
}
