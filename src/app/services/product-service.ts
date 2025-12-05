import { Injectable } from '@angular/core';
import { BaseService } from './base-service';
import { Product } from '../models/product';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseService<Product> {
  override endpoint = 'products';

  importProducts(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.getURL()}/import`, formData);
  }

  previewFile(file: File): Observable<any[]> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any[]>(`${this.getURL()}/import/preview`, formData);
  }
}
