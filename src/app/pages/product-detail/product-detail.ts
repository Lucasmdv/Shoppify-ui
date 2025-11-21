import { Component, inject, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

// Models y Services
import { Product, ProductParams } from '../../models/product';
import { CartService } from '../../services/cart-service';
import { ProductCard } from '../../components/product-card/product-card';
import { StorageService } from '../../services/storage-service';
import { AuthService } from '../../services/auth-service';
import { WishlistService } from '../../services/wishlist-service';
import { CartSignal } from '../../services/cart-signal.service'; // Asegúrate de importar esto bien

@Component({
  selector: 'app-product-detail',
  imports: [ProductCard, DecimalPipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {

  private aService = inject(AuthService);

  product!: Product;
  id?: number;
  userId?: number = this.aService.user()?.id || undefined;
  

  relatedProducts: Product[] = [];
  isHidden: boolean = false;
  isFavorite: boolean = false;
  

  isQuantityOpen = false;
  selectedQuantity = 1;
  maxAvailable: number = 1;      
  dropdownOptions: number[] = []; 

  constructor(
    private pService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private cartService: CartService,
    private cSignalService: CartSignal, 
    private localStorage: StorageService,
    private wishlistService: WishlistService
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
        this.selectedQuantity = 1;


        this.loadRelatedProducts();
        this.calculateStockFromSignal();
      },
      error: (e) => {
        console.log(e);
        this.router.navigate(['/']);
      }
    });
  }


  calculateStockFromSignal() {

    if (!this.userId) {
      this.updateDropdownLogic(this.product.stock);
      return;
    }

    const cart = this.cSignalService.cart(); 
    
    const foundItem = cart?.items.find(item => item.product?.id === this.product.id);

    const remaining = foundItem 
      ? this.product.stock - foundItem.quantity 
      : this.product.stock;

    this.updateDropdownLogic(remaining);
  }

  private updateDropdownLogic(limit: number) {
    this.maxAvailable = Math.max(0, limit);
    const optionsToShow = Math.min(this.maxAvailable, 6);
    this.dropdownOptions = Array.from({ length: optionsToShow }, (_, i) => i + 1);
  
    if (this.selectedQuantity > this.maxAvailable) {
        this.selectedQuantity = 1;
    }
  }

  loadRelatedProducts(): void {
    const filters: ProductParams = {
      page: 0,
      size: 5 
    };


    if (this.product?.categories?.length) {
      filters.categories = this.product.categories.join(',');
    }

    this.pService.getList(filters).subscribe({
      next: products => {
        this.relatedProducts = (products.data || [])
          .filter(item => item.id !== this.product.id)
          .slice(0, 4); 
      },
      error: (e) => console.error('Error loading related products:', e)
    });
  }

  // --- Lógica Wishlist ---

  checkFavorite() {
    if (!this.userId) return;
    this.wishlistService.isFavorite(this.userId, this.id!).subscribe({
      next: (value) => this.isFavorite = value
    });
  }

  toggleFavorite() {
    if (!this.userId) {
      this.router.navigate(["auth/login"]);
      return;
    }
    this.wishlistService.toggleItem(this.userId, this.product.id!).subscribe({
      next: (response) => {
        const isRemoved = response === false;
        this.isFavorite = !isRemoved;
        const message = isRemoved ? 'Eliminado de favoritos' : 'Agregado a favoritos';
        this.showToast(message, 'success');
      },
      error: (err) => {
        console.error(err);
        this.showToast('Error al actualizar favoritos', 'error');
      }
    });
  }

  // --- UI Helpers & Dropdown ---

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
      text: `Ingresa un valor entre 1 y ${this.maxAvailable}`,
      input: "number",
      inputAttributes: {
        min: "1",
        step: "1",
        max: this.maxAvailable.toString()
      },
      inputValue: this.selectedQuantity,
      showCancelButton: true,
      confirmButtonText: "Aplicar",
      cancelButtonText: "Cancelar"
    });

    if (!value) return;
    const parsed = Number(value);

    if (Number.isNaN(parsed) || parsed < 1) return;

    if (parsed > this.maxAvailable) {
        this.showToast(`Solo hay ${this.maxAvailable} unidades disponibles`, 'error');
        return;
    }

    this.selectedQuantity = this.normalizeQuantity(parsed);
    this.isQuantityOpen = false;
  }

  private normalizeQuantity(qty: number) {
    return Math.max(1, Math.min(qty, this.maxAvailable));
  }

  // --- Acciones de Carrito ---

  onAddToCart(): void {
    if (!this.product) return;

    if (!this.aService.isLogged) {
      Swal.fire({
        icon: "warning",
        title: "Atención",
        text: "Debes iniciar sesión para agregar productos"
      }).then(() => this.router.navigate(['/auth/login']));
      return;
    } 

    const userId = this.aService.user()!.id!;
    
    this.cartService.addItem(userId, this.product.id!, this.selectedQuantity).subscribe({
      next: () => {
        this.showCartSuccessToast(this.product.name);

        this.calculateStockFromSignal(); 
      },
      error: (err) => {
        console.error(err);
        this.showToast('No se pudo agregar al carrito', 'error');
      }
    });
  }

  onBuyNow(): void {
    if (!this.aService.isLogged) {
      Swal.fire({ icon: "warning", title: "Inicia sesión" })
        .then(() => this.router.navigate(['/auth/login']));
      return;
    }
    
    const userId = this.aService.user()!.id!;
    this.cartService.addItem(userId, this.product.id!, this.selectedQuantity).subscribe({
      next: () => this.router.navigate(['/cart']),
      error: err => console.error(err)
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

  showCartSuccessToast = (productName: string) => {
    Swal.fire({
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
      icon: 'success',
      title: `"${productName}" agregado.`,
      customClass: { popup: 'swal2-toast-dark' }
    });
  }
}