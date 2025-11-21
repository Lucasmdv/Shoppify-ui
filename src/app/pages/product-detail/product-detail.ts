import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ProductService } from '../../services/product-service';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../models/product';
import { ProductCard } from '../../components/product-card/product-card';
import Swal from 'sweetalert2';
import { StorageService } from '../../services/storage-service';
import { AuthService } from '../../services/auth-service';
import { WishlistService } from '../../services/wishlist-service';
import { CartSignal } from '../../services/cart-signal';

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
    private cSignalService: CartSignal,
    private localStorage: StorageService,
    private wishlistService: WishlistService
  ) { }

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

  checkFavorite() {

    if (!this.userId) {
      return
    }

    this.wishlistService.isFavorite(this.userId, this.id!).subscribe({
      next: (value) => {
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

  async onAddToCart(productId: number, productName: string) {
    const user = this.aService.user();
    if (!user) return

    try {
      await this.cSignalService.addItem(user.id!, productId, 1);
      Swal.fire({ icon: 'success', 
        title: `${productName} agregado al carrito` 
      })
    } catch {
      Swal.fire({ icon: 'error', 
        title: 'No se pudo agregar el producto' 
      })
    }
  }

  async onBuyNow(productId: number) {
    const user = this.aService.user()
    if (!user) return

    try {
      await this.cSignalService.addItem(user.id!, productId, 1);
      this.router.navigate(['/cart'])
    } catch {
      Swal.fire({ 
        icon: 'error', 
        title: 'No se pudo agregar el producto' 
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
