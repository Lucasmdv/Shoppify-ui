import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { FormBuilder } from '@angular/forms';
import { CartService } from '../../services/cart-service';
import { Router } from '@angular/router';
import { TransactionService } from '../../services/transaction-service';
import Swal from 'sweetalert2';
import { Cart, DetailCart } from '../../models/cart/cartResponse';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MercadopagoButton } from '../../components/mercadopago-button/mercadopago-button';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, MercadopagoButton],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout {
  private aService = inject(AuthService);
  private fb = inject(FormBuilder);
  public cService = inject(CartService);
  private router = inject(Router);
  private tService = inject(TransactionService);

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
}
