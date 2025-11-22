import { AfterViewInit, Component, inject, Input, input } from '@angular/core';
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
export class MercadopagoButton implements AfterViewInit {
  private tService = inject(TransactionService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private mpService = inject(MercadoPagoService);


  @Input() cartItems: DetailCart[] = [];

  async ngAfterViewInit(): Promise<void> {
    await this.mpService.loadSdk();
    await this.renderWalletFromBackend();
  }

  private async renderWalletFromBackend() {
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
      { paymentMethod: 'DIGITAL', description: 'Mercado Pago checkout' },
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
      await mp.bricks().create('wallet', 'walletBrick_container', {
        initialization: { preferenceId: pref.preferenceId }
      });
    } catch (error) {
      console.error('Error al inicializar Mercado Pago', error);
    }
  }
}
