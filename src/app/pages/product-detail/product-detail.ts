import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

// Models
import { Product } from '../../models/product';

// Services
import { ProductService } from '../../services/product-service';
import { CartService } from '../../services/cart-service';
import { StorageService } from '../../services/storage-service';
import { AuthService } from '../../services/auth-service';
import { WishlistService } from '../../services/wishlist-service';

// Components
import { ProductCard } from '../../components/product-card/product-card';
import { ProductParams } from '../../models/filters/productParams';
import { cilBell } from '@coreui/icons';


@Component({
  selector: 'app-product-detail',
  imports: [ProductCard, DecimalPipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {

  icons = { cilBell };

  private aService = inject(AuthService);

  product!: Product;
  id?: number;
  userId?: number = this.aService.user()?.id || undefined;
  relatedProducts: Product[] = [];

  isHidden: boolean = false;
  isFavorite: boolean = false;
  isQuantityOpen = false;

  // Quantity Logic
  selectedQuantity = 1;
  maxAvailable: number = 0;
  dropdownOptions: number[] = [];
  cartQuantity = 0;

  constructor(
    private pService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
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

      },
      error: () => this.router.navigate(['/'])
    });
  }

  renderProduct(id: number) {
    this.pService.get(id).subscribe({
      next: prod => {
        if (prod.inactive) {
          Swal.fire({
            title: 'Producto no disponible',
            text: 'Este producto no se encuentra disponible momentaneamente.',
            icon: 'info',
            confirmButtonText: 'Volver al catálogo'
          }).then(() => {
            this.router.navigate(['/products']);
          });
          return;
        }
        
        this.product = prod;
        this.isHidden = prod.inactive;
        this.selectedQuantity = 1;
        this.cartQuantity = 0;
        this.loadRelatedProducts();

        if (this.userId) {
          this.calculateRemainingStock();
        } else {
          this.updateDropdownLogic(this.product.stock);
          this.cartQuantity = 0;
        }
      },
      error: (e) => {
        console.log(e);
        this.router.navigate(['/']);
      }
    });
  }

  loadRelatedProducts(): void {
    const filters: ProductParams = {
      page: 0,
      size: 4
    };

    if (this.product?.categories?.length) {
      filters.categories = this.product.categories.join(',');
    }

    this.pService.getList(filters).subscribe({
      next: products => {
        this.relatedProducts = (products.data || [])
          .filter(item => item.id !== this.product.id)
          .slice(0, 3);
      },
      error: (e) => {
        console.error('Error loading related products:', e);
      }
    });
  }

  // --- Lógica de Favoritos ---

  checkFavorite() {
    if (!this.userId) {
      return;
    }
    this.wishlistService.isFavorite(this.userId, this.id!).subscribe({
      next: (value) => {
        this.isFavorite = value;
      },
    });
  }

  toggleFavorite(notification: boolean = false) {
    if (!this.userId) {
      this.router.navigate(["auth/login"]);
      return;
    }
    this.wishlistService.toggleItem(this.userId, this.product.id!).subscribe({
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



  // --- Lógica de Cantidad y Stock ---

  calculateRemainingStock() {
    const currentUserId = this.localStorage.getUser()?.id || this.userId;

    this.cartService.getCart(currentUserId).subscribe({
      next: (cart) => {
        const foundItem = cart.items.find(item => item.product?.id === this.product.id);


        const remaining = foundItem
          ? this.product.stock - foundItem.quantity!
          : this.product.stock;

        this.cartQuantity = foundItem?.quantity ?? 0;
        this.updateDropdownLogic(remaining);
      },
      error: (err) => {
        console.error("Error checking cart:", err);

        this.cartQuantity = 0;
        this.updateDropdownLogic(this.product.stock);
      }
    });
  }


  private updateDropdownLogic(limit: number) {
    this.maxAvailable = Math.max(0, limit);

    const optionsToShow = Math.min(this.maxAvailable, 4);
    this.dropdownOptions = Array.from({ length: optionsToShow }, (_, i) => i + 1);

    if (this.maxAvailable === 0) {
      this.isQuantityOpen = false;
      this.selectedQuantity = 1;
    } else {
      this.selectedQuantity = this.normalizeQuantity(this.selectedQuantity);
    }
  }

  toggleQuantityDropdown() {
    this.isQuantityOpen = !this.isQuantityOpen;
  }

  selectQuantity(qty: number) {
    this.selectedQuantity = this.normalizeQuantity(qty);
    this.isQuantityOpen = false;
  }

  async selectCustomQuantity() {
    const { value } = await Swal.fire({
      title: "Elegir cantidad",
      input: "number",
      inputAttributes: {
        min: "1",
        step: "1",
        max: this.maxAvailable.toString()
      },
      inputValue: Math.max(this.selectedQuantity, 5),
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar"
    });

    const parsed = Number(value);
    if (!value || Number.isNaN(parsed)) return;
    if (parsed < 1) return;

    this.selectedQuantity = this.normalizeQuantity(parsed);
    this.isQuantityOpen = false;
  }

  private normalizeQuantity(qty: number) {
    return Math.max(1, Math.min(qty, this.maxAvailable));
  }



  // --- Acciones de Compra ---

  onAddToCart(): void {
    if (!this.product) return;

    if(this.product.inactive){
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: "Este producto no está disponible para agregar al carrito"
      });
      return;
    }

    if (!this.aService.isLogged) {
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: "Debes iniciar sesión para agregar productos al carrito"
      }).then(() => {
        this.router.navigate(['/auth/login']);
      });
    } else {
      const userId = this.aService.user()!.id!;

      if (this.selectedQuantity > this.maxAvailable) {
        this.showToast('No hay suficiente stock disponible', 'error');
        return;
      }

      this.cartService.addItem(userId, this.product.id!, this.selectedQuantity).subscribe({
        next: () => {
          this.showCartSuccessToast(this.product.name);
          this.calculateRemainingStock();
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "No se pudo agregar el producto al carrito"
          });
        }
      });
    }
  }

  onBuyNow(): void {

    if(this.product.inactive){
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: "Este producto no está disponible para agregar al carrito"
      });
      return;
    }
    
    if (!this.aService.isLogged) {
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: "Debes iniciar sesión para comprar productos"
      }).then(() => {
        this.router.navigate(['/auth/login']);
      });
    } else {
      const userId = this.aService.user()!.id!;

      if (this.maxAvailable < 1) {
        this.router.navigate(['/cart']);
        return
      }
      this.cartService.addItem(userId, this.product.id!, this.selectedQuantity).subscribe({
        next: () => {
          this.router.navigate(['/cart']);
        },
        error: err => console.error(err)
      });
    }
  }

  // --- Helpers UI ---

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
    });
  }
}
