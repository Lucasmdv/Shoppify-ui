import { Component, inject, viewChild } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { CartService } from '../../services/cart-service';
import Swal from 'sweetalert2';
import { DetailCart } from '../../models/cart/cartResponse';
import { CommonModule } from '@angular/common';
import { MercadopagoButton } from '../../components/mercadopago-button/mercadopago-button';
import { BackButtonComponent } from '../../components/back-button/back-button';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, MercadopagoButton, BackButtonComponent],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  private aService = inject(AuthService);
  public cService = inject(CartService);
  private mpButton = viewChild(MercadopagoButton);

  total: number = 0;
  items: DetailCart[] = [];

  ngOnInit(): void {
    this.cService.getCart(this.aService.user()!.id!).subscribe({
      next: (cart) => {
        this.items = cart.items;
        this.total = cart.total;
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'Oops..',
          text: 'Hubo un error al cargar los items del carrito',
        });
      },
    });
  }

  checkAndCancelTransaction() {
    this.mpButton()?.checkAndCancelTransaction();
  }
}
