import { Component, inject, Inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SearchBar } from '../search-bar/search-bar';
import { UserAvatar } from '../user-avatar/user-avatar';
import { User } from '../../models/auth/user';
import { ImageFallbackDirective } from '../../core/directives/image-fallback';
import { BadgeComponent } from '@coreui/angular';
import { CartService } from '../../services/cart-service';
import { AuthService } from '../../services/auth-service';
import { NotificationDropdown } from '../notification-dropdown/notification-dropdown';

@Component({
  selector: 'app-header',
  imports: [RouterLink, SearchBar, UserAvatar, ImageFallbackDirective, BadgeComponent, NotificationDropdown],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {

 public cartService = inject(CartService)

  mostrarNav = false
  mostrarBusquedaMovil = false

  user!: User
  itemsInCart = 0

  constructor(
    private router: Router,
    
    private authService: AuthService
  ) {
    this.verifyCart()
  }

  verifyCart(){
    if (this.authService.user()) {
      this.user = this.authService.user()!
      this.cartService.getCart(this.user.id!).subscribe({
        next: (cart: any) => {
          this.itemsInCart = cart.items.length
        }
      })
    }
  }

  toggleNav() {
    this.mostrarNav = !this.mostrarNav;
    if (this.mostrarNav) {
      this.mostrarBusquedaMovil = false;
    }
  }

  toggleBusquedaMovil() {
    this.mostrarBusquedaMovil = !this.mostrarBusquedaMovil;
    if (this.mostrarBusquedaMovil) {
      this.mostrarNav = false;
    }
  }

  gotoHot() {
    this.router.navigate(['/products'], {
      queryParams: {
        page: 0,
        size: 8,
        discountGreater: 0,
      },
    })
  }
}
