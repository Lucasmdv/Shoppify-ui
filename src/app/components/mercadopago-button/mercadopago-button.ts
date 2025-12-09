import { AfterViewInit, Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { TransactionService } from '../../services/transaction-service';
import { CartService } from '../../services/cart-service';
import { AuthService } from '../../services/auth-service';
import { MercadoPagoService } from '../../services/mercado-pago-service';
import { DetailCart } from '../../models/cart/cartResponse';

@Component({
  selector: 'app-mercadopago-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mercadopago-button.html',
  styleUrl: './mercadopago-button.css'
})
export class MercadopagoButton implements AfterViewInit, OnChanges {
  private tService = inject(TransactionService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private mpService = inject(MercadoPagoService);
  private viewReady = false;


  @Input() cartItems: DetailCart[] = [];

  async ngAfterViewInit(): Promise<void> {
    await this.mpService.loadSdk();
    this.viewReady = true;

    if (this.cartItems.length) {
      await this.renderWalletFromBackend();
    }
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if(changes['cartItems'] && this.cartItems.length > 0 && this.viewReady) {
      await this.renderWalletFromBackend();
    }
  }

  private async renderWalletFromBackend() {
    await this.mpService.loadSdk();

    const user = this.authService.user();
    if (!user?.id) {
      console.warn('Usuario no logueado. No se puede crear la preferencia.');
      return;
    }

    if (!this.cartItems?.length) {
      console.warn('Carrito vacio. No se puede crear la preferencia.');
      return;
    }

    const salePayload = this.cartService.prepareSaleRequest(
      user.id,
      this.cartItems
    );

    if (!salePayload) {
      console.warn('No se pudo armar el payload de venta.');
      return;
    }

    const pref = await firstValueFrom(this.tService.createPreference(salePayload));
    if (!pref?.preferenceId) {
      console.error('El backend no devolvio preferenceId');
      return;
    }

    try {
      const mp = this.mpService.initialize();
      const container = document.getElementById('walletBrick_container');
      if (container) container.innerHTML = ''; // Clear previous button if any
      
      await mp.bricks().create('wallet', 'walletBrick_container', {
        initialization: { preferenceId: pref.preferenceId }
      });
    } catch (error) {
      console.error('Error al inicializar Mercado Pago', error);
    }
  }
}
