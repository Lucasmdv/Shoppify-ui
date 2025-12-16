import { Component, ElementRef, inject, input, OnDestroy, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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
export class MercadopagoButton implements OnDestroy {
  private tService = inject(TransactionService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private mpService = inject(MercadoPagoService);

  public cartItems = input<DetailCart[]>([]);
  public loading = signal(false);
  public error = signal<string | null>(null);
  public preferenceId = signal<string | null>(null);

  private containerRef = viewChild<ElementRef>('walletBrickContainer');
  private brickController: any = null;

  ngOnInit() {
    const active = this.cartService.activeTransaction();
    if (active) {
      console.log("Resuming existing transaction:", active);
      this.preferenceId.set(active.preferenceId);
      setTimeout(() => {
        this.renderBrick(active.preferenceId);
      }, 100);
    }
  }

  async generatePayment() {
    this.error.set(null);
    this.loading.set(true);

    try {
      const items = this.cartItems();
      if (!items || items.length === 0) return;

      const user = this.authService.user();
      if (!user?.id) throw new Error('Usuario no logueado');

      const salePayload = this.cartService.prepareSaleRequest(user.id, items);

      console.log('Generando preferencia con payload:', JSON.stringify(salePayload, null, 2));

      if (!salePayload) return;

      const pref = await this.tService.createPreference(salePayload).toPromise();

      if (pref?.preferenceId) {
        // Updated: Store the active transaction so we can cancel it if needed
        this.cartService.setActiveTransaction({
          preferenceId: pref.preferenceId,
          transactionId: pref.transactionId // Assuming this exists, validating next
        });

        this.preferenceId.set(pref.preferenceId);
        // Wait for change detection to reveal container
        setTimeout(() => {
          this.renderBrick(pref.preferenceId);
        }, 100);
      }
    } catch (err: any) {
      console.error('Error info:', err);
      this.error.set(err.message || 'Error al crear preferencia');
      this.loading.set(false);
    }
  }

  checkAndCancelTransaction() {
    this.cartService.cancelActiveTransaction();
    this.preferenceId.set(null);
    this.unmountBrick();
  }

  private async renderBrick(preferenceId: string) {
    try {
      await this.mpService.loadSdk();
      this.unmountBrick(); // Clean up previous instance

      const mp = this.mpService.initialize();
      const container = this.containerRef()?.nativeElement;

      if (container) {
        console.log('Inicializando Brick con preferenceId:', preferenceId);

        this.brickController = await mp.bricks().create('wallet', 'walletBrick_container', {
          initialization: { preferenceId: preferenceId },
          customization: {
            visual: {
              hideValue: false // Example customization
            }
          }
        });
      } else {
        console.error("Container not found!");
      }
    } catch (err) {
      console.error('Error renderizando Brick', err);
      this.error.set('Error inicializando MercadoPago');
    } finally {
      this.loading.set(false);
    }
  }

  private unmountBrick() {
    if (this.brickController) {
      try {
        this.brickController.unmount();
      } catch (e) {
        console.warn('Error unmounting brick', e);
      }
      this.brickController = null;
    }
  }

  ngOnDestroy(): void {
    // Ensure we cancel if the user navigates away without completing
    this.checkAndCancelTransaction();
  }
}

