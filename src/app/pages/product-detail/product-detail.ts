import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../services/product-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../models/product';
import { CartService } from '../../services/cart-service';
import { ProductCard } from '../../components/product-card/product-card';
import Swal from 'sweetalert2';
import { StorageService } from '../../services/storage-service';
import { AuthService } from '../../services/auth-service';
import { WishlistService } from '../../services/wishlist-service';

@Component({
  selector: 'app-product-detail',
  imports: [ProductCard, DecimalPipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {

  private aService = inject(AuthService)

  product!: Product;
  id?: number;
  userId?: number = this.aService.user()?.id || undefined
  relatedProducts: Product[] = [];
  isHidden: boolean = false;
  isFavorite: boolean = false;
  


  constructor(
    private pService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private localStorage: StorageService,
    private wishlistService:WishlistService
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
        this.checkFavorite();
        this.renderProduct(parsedId);
        this.loadRelatedProducts();
      },
      error: () => this.router.navigate(['/'])

      
    
    });

    this.localStorage.getHiddenProductIds();
    this.isHidden = this.localStorage.getHiddenProductIds().includes(this.id || -1);
   
  }

  renderProduct(id: number) {
    this.pService.get(id).subscribe({
      next: prod => {
        this.product = prod;
      },
      error: (e) => {
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

//Wishlist button logic

  checkFavorite(){
  
  if(!this.userId){
   return
  }

    this.wishlistService.isFavorite(this.userId,this.id!).subscribe({
      next:(value) => {
        this.isFavorite = value
      },
    })
  }

toggleFavorite() {
  if (!this.userId) {
    this.router.navigate(["auth/login"]);
    return;
  }
  this.wishlistService.toggleItem(this.userId, this.product.id).subscribe({
    next: (response) => {
      const isRemoved = response === false;
      this.isFavorite = !isRemoved;
      const message = isRemoved 
        ? 'Producto eliminado de favoritos' 
        : 'Producto agregado a favoritos';
      this.showToast(message, 'success');
    },
    error: (err) => {
      console.error(err);
      this.showToast('Error al actualizar favoritos', 'error');
    }
  });
}

private showToast(title: string, icon: 'success' | 'error' | 'info' = 'success') {
  Swal.fire({
    toast: true,
    position: 'bottom-end',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    icon: icon,
    title: title
  });
}


 

  

  onAddToCart(): void {
    if (!this.product) return;

    if (!this.aService.isLogged) {
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: "Debes iniciar sesión para agregar productos al carrito"
      }).then(() => {
        this.router.navigate(['/auth/login']);
      })
    } else {

      const userId = this.aService.user()!.id!;
      this.cartService.addItem(userId, this.product.id!, 1).subscribe({
        next: () => {
          this.showCartSuccessToast(this.product.name);
        },
        error: (err) => {
          console.error(err)
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No se pudo agregar el producto al carrito"
          })
        }
      })
    }
  }

  onBuyNow(): void {
    if (!this.aService.isLogged) {
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: "Debes iniciar sesión para comprar productos"
      }).then(() => {
        this.router.navigate(['/auth/login'])
      })
    } else {
      const userId = this.aService.user()!.id!

      this.cartService.addItem(userId, this.product.id!, 1).subscribe({
        next: () => {
          this.router.navigate(['/cart'])
        },
        error: err => console.error(err)
      })
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
