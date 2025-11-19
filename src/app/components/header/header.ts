import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SearchBar } from '../search-bar/search-bar';
import { UserAvatar } from '../user-avatar/user-avatar';
import { User } from '../../models/auth/user';
import { ImageFallbackDirective } from '../../core/directives/image-fallback';
import { BadgeComponent, ButtonDirective } from '@coreui/angular';
import { CartService } from '../../services/cart-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, SearchBar, UserAvatar, ImageFallbackDirective, ButtonDirective, BadgeComponent],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header{


   constructor(private router:Router){}
 
  private cService = inject(CartService)

  mostrarNav = false;
  mostrarBusquedaMovil = false;
  user! : User
  itemsInCart = this.cService.itemsInCart

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


