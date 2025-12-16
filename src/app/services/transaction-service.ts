import { Injectable, inject } from '@angular/core';
import { Transaction } from '../models/transaction';
import { BaseService } from './base-service';
import { Purchase } from '../models/purchase';
import { SaleRequest } from '../models/sale';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { MercadoPagoPreference } from '../models/mercadopago';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService extends BaseService<Transaction> {
  override endpoint = 'transactions';
  private readonly API = environment.apiUrl;
  private auth = inject(AuthService);

  constructor(protected override http: HttpClient) {
    super(http)
  }

  postPurchase(p: Purchase) {
    return this.http.post<Purchase>(this.API + "/purchases", p)
  }

  postSale(p: SaleRequest) {
    return this.http.post<SaleRequest>(this.API + "/" + this.endpoint + "/sales", p)
  }

  createPreference(p: SaleRequest) {
    return this.http.post<MercadoPagoPreference>(`${this.API}/mercadopago/preferences`, p);
  }

  cancelTransaction(id: number) {
    return this.http.post<void>(`${this.API}/transactions/${id}/cancel`, {});
  }
}
