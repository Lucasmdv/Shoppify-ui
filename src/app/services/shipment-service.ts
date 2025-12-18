import { inject, Injectable } from '@angular/core';
import { BaseService } from './base-service';
import { Shipment, UpdateShipmentRequest } from '../models/shipment';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ShipmentService extends BaseService<Shipment>{
  override endpoint = 'shipments'
  private readonly API = environment.apiUrl
 
  constructor(protected override http: HttpClient) {
    super(http)
  }

  updateStatus(status: string, id: number) {
    return this.http.patch<UpdateShipmentRequest>(`${this.API}/${this.endpoint}/${id}`, {status: status})
  }
}