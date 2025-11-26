import { Injectable } from '@angular/core';
import { BaseService } from './base-service';
import { Shipment } from '../models/shipment';

@Injectable({
  providedIn: 'root'
})
export class ShipmentService extends BaseService<Shipment>{
  override endpoint = 'shipments'
}