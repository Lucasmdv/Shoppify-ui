import { Component, inject, OnInit } from '@angular/core';
import { Shipment } from '../../models/shipment';
import { ShipmentService } from '../../services/shipment-service';
import { ShipmentCard } from '../../components/shipment-card/shipment-card';
import { UserService } from '../../services/user-service';
import { AuthService } from '../../services/auth-service';

@Component({
  selector: 'app-shipments',
  imports: [ShipmentCard],
  templateUrl: './shipments.html',
  styleUrl: './shipments.css'
})
export class Shipments implements OnInit{
  shipments: Shipment[] = []

  shipmentService = inject(ShipmentService)
  aService = inject(AuthService)
  isAdmin = this.aService.permits().includes('ADMIN')

  ngOnInit(): void {
    this.getShipments()
  }

  getShipments() {
    this.shipmentService.getList().subscribe({
      next: data => {
        this.shipments = data.data
      }
    })
  }
}
