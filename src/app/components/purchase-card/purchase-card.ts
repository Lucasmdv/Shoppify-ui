import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { Transaction } from '../../models/transaction';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user-service';
import { Shipment } from '../../models/shipment';
import { ShipmentService } from '../../services/shipment-service';
import { ShipmentCard } from '../shipment-card/shipment-card';

@Component({
  selector: 'app-purchase-card',
  imports: [DatePipe, DecimalPipe, ShipmentCard],
  templateUrl: './purchase-card.html',
  styleUrl: './purchase-card.css'
})
export class PurchaseCard implements OnInit{
  shipment!: Shipment

  @Input() purchase!: Transaction
  @Input() i!: number
  @Input() isAdmin!: boolean
  @Input() showShipment!: boolean

  activePurchase = signal<number | null>(null)
  clientsExpanded = signal<Set<number>>(new Set())
  clientsCache = signal<Map<number, any>>(new Map())

  uService = inject(UserService)
  sService = inject(ShipmentService)
  router = inject(Router)

  ngOnInit(): void {
    if(this.showShipment) {
      this.getShipment()
    }
  }

  gotoDetailsProduct(id?:number){
   this.router.navigate(["/products/details", id]);
  }

  getClientInfo(clientId?: number){
    if (!clientId && clientId !== 0) return null

    const cache = this.clientsCache();

    if (cache.has(clientId as number)) {
      return cache.get(clientId as number);
    }

    this.uService.get(clientId as number).subscribe({
      next: (data) => {
        const clientData = {
          firstName: data.firstName,
          lastName: data.lastName,
          dni: data.dni,
          phone: data.phone,
          email: data.email,
          img: data.img,
          dateOfRegistration: data.dateOfRegistration,
        }
        cache.set(clientId as number, clientData);
        this.clientsCache.set(new Map(cache))
      },
      error: (err) => {
        console.error('Error al obtener info del cliente:', err)
      }
    })

    return cache.get(clientId as number)
  }

  getShipment() {
    this.sService.get(this.purchase.id!).subscribe({
      next: data => this.shipment = data,
      error: () => console.error('Error al obtener info del envio')
    })
  }

  toggleDetails(i: number): void {
    this.activePurchase.set(this.activePurchase() === i ? null : i)
  }

  toggleClientInfo(clientId?: number){
    if (!clientId && clientId !== 0) return

    const set = new Set(this.clientsExpanded())
    if (set.has(clientId)){
      set.delete(clientId)
    } else {
      set.add(clientId)
      this.getClientInfo(clientId)
    }
    this.clientsExpanded.set(set)
  }
}
