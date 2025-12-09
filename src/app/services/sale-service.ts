import { Injectable } from '@angular/core';
import { Sale } from '../models/sale';
import { BaseService } from './base-service';

@Injectable({
  providedIn: 'root'
})
export class SaleService extends BaseService<Sale> {
  override endpoint = "sales"
}
