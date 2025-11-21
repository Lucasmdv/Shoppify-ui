import { Component, effect, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SearchBar } from '../search-bar/search-bar';
import { UserAvatar } from '../user-avatar/user-avatar';
import { User } from '../../models/auth/user';
import { ImageFallbackDirective } from '../../core/directives/image-fallback';
import { BadgeComponent, ButtonDirective } from '@coreui/angular';
import { AuthService } from '../../services/auth-service';
import { CartSignal } from '../../services/cart-signal';

@Component({
  selector: 'app-header',
  imports: [RouterLink, SearchBar, UserAvatar, ImageFallbackDirective, ButtonDirective, BadgeComponent],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {

  mostrarNav = false
  mostrarBusquedaMovil = false

  user!: User
  itemsInCart = signal<number>(0)

  constructor(
    private router: Router,
    private cSignalService: CartSignal,
    private aService: AuthService
  ) {}

  ngOnInit() {
    const user = this.aService.user();
    if (user) {
      this.cSignalService.syncCart(user.id!);

      effect(() => {
        const cart = this.cSignalService.cartSignal();
        this.itemsInCart.set(
          cart ? cart.items.reduce((acc, item) => acc + (item.quantity || 0), 0) : 0
        )
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
