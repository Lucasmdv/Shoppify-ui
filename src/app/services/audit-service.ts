import { Injectable } from '@angular/core';
import { BaseService } from './base-service';
import { Transaction } from '../models/transaction';
import { HttpParams } from '@angular/common/http';
import { SalesParams } from '../models/filters/salesParams';

@Injectable({
  providedIn: 'root'
})
export class AuditService extends BaseService<Transaction> {
  override endpoint = this.API_URL + '/sales'

  getAllTransactions(filters?: SalesParams) {
    let params = new HttpParams()

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params = params.set(key, value.toString())
        }
      })
    }

    return this.http.get<any>(this.endpoint, { params })
  }
}
