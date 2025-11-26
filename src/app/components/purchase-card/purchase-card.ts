import { Component, inject, Input, signal } from '@angular/core';
import { Transaction } from '../../models/transaction';
import { DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-purchase-card',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './purchase-card.html',
  styleUrl: './purchase-card.css'
})
export class PurchaseCard {
  @Input() purchase!: Transaction
  @Input() i!: number
  @Input() isAdmin!: boolean

  activePurchase = signal<number | null>(null)
  clientsExpanded = signal<Set<number>>(new Set())
  clientsCache = signal<Map<number, any>>(new Map())

  uService = inject(UserService)
  router = inject(Router)

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
