import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MercadoPagoService {
  private document = inject(DOCUMENT);
  private readonly MP_SDK_URL = 'https://sdk.mercadopago.com/js/v2';
  private readonly publicKey = environment.mpPk;

  private loaded = false;


  loadSdk(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.loaded || this.document.getElementById('mp-sdk')) {
        resolve();
        return;
      }

      const script = this.document.createElement('script');
      script.id = 'mp-sdk';
      script.src = this.MP_SDK_URL;
      script.onload = () => {
        this.loaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Error al cargar Mercado Pago SDK'));
      this.document.body.appendChild(script);
    });
  }

  initialize() {
    if (!this.loaded) throw new Error('SDK no cargado');
    return new (window as any).MercadoPago(this.publicKey);
  }
}