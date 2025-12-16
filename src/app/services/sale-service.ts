import { Injectable } from '@angular/core';
import { Sale } from '../models/sale';
import { BaseService } from './base-service';
import { Observable } from 'rxjs';
import { PaginatedResponse } from '../models/hal/paginatedResponse';
import { HttpParams } from '@angular/common/http';
import { ResponseJSON } from '../models/hal/responseJson';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SaleService extends BaseService<Sale> {
  override endpoint = "sales"

  override getList(filterParams?: any): Observable<PaginatedResponse<Sale>> {
    const defaultParams = {
      page: 0,
      size: 10
    };

    const combinedParams = {
      ...defaultParams,
      ...filterParams
    };

    const finalParams: any = {};
    Object.keys(combinedParams).forEach(key => {
      const value = combinedParams[key];
      if (value !== null && value !== undefined && value !== '') {
        finalParams[key] = value;
      }
    });

    return super.getList(finalParams);
  }

  getMySales(filterParams?: any): Observable<PaginatedResponse<Sale>> {
    const defaultParams = {
      page: 0,
      size: 10
    };

    const combinedParams = {
      ...defaultParams,
      ...filterParams
    };

    let params = new HttpParams();
    Object.keys(combinedParams).forEach(key => {
      const value = combinedParams[key];
      if (value !== null && value !== undefined && value !== '') {
        params = params.set(key, value);
      }
    });

    return this.http.get<ResponseJSON<Sale>>(`${this.getURL()}/mySales`, { params }).pipe(
      map((response: ResponseJSON<Sale>) => {
        const dataList = this.unwrapEmbeddedList(response?._embedded);
        const pageInfo = response.page;
        return { data: dataList, page: pageInfo };
      })
    );
  }

  getMySaleById(id: number): Observable<Sale> {
    return this.http.get<Sale>(`${this.getURL()}/mySales/${id}`);
  }
}
