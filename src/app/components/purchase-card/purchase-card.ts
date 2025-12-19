import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { PaymentStatus, Transaction } from '../../models/transaction';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user-service';
import { Shipment, Status } from '../../models/shipment';
import { ShipmentService } from '../../services/shipment-service';

@Component({
  selector: 'app-purchase-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './purchase-card.html',
  styleUrl: './purchase-card.css'
})
export class PurchaseCard implements OnInit {
  
  @Input() purchase!: Transaction
  @Input() i!: number
  @Input() isAdmin!: boolean
  @Input() showShipment!: boolean
  @Input() showRebuy: boolean = true
  @Input() showTotal: boolean = false
  @Input() showDate: boolean = true

  shipment: Shipment | null = null;
  public Status = Status; 

  clientsExpanded = signal<Set<number>>(new Set())
  clientsCache = signal<Map<number, any>>(new Map())

  uService = inject(UserService)
  sService = inject(ShipmentService)
  router = inject(Router)

  ngOnInit(): void {
    console.log('Purchase ID:', this.purchase.id, 'PaymentStatus:', this.purchase.paymentStatus, 'Detail:', this.purchase.paymentDetail?.status);
    if(this.showShipment && this.purchase.id) {
      this.getShipment()
    }
  }

  getShipment() {
    this.sService.get(this.purchase.id!).subscribe({
      next: data => {
        this.shipment = data;
      },
      error: () => console.log('Info de envío no disponible para compra ' + this.purchase.id)
    })
  }

  isDelivered(): boolean {
    return this.shipment?.status === Status.DELIVERED;
  }

  isApproved(): boolean {
    return this.purchase?.paymentStatus === PaymentStatus.APPROVED || 
           this.purchase?.paymentDetail?.status === 'approved';
  }
  
  getMainStatusMessage(): string {
     // 1. Payment Errors/Warnings
     if (this.purchase?.paymentStatus === PaymentStatus.CANCELLED) {
       return 'Venció el plazo para pagar tu compra';
     }
     if (this.purchase?.paymentStatus === PaymentStatus.REJECTED) {
       return 'Hubo un problema con tu pago';
     }
     if (this.purchase?.paymentStatus === PaymentStatus.PENDING && !this.isApproved()) {
       return 'Esperando confirmación del pago';
     }

     // 2. Shipment Success/Active
     if (this.shipment?.status === Status.DELIVERED) {
       return 'Llegó el ' + (this.shipment.endDate ? new Date(this.shipment.endDate).toLocaleDateString() : '');
     }
     if (this.shipment?.status === Status.SHIPPED) {
        const isPickup = !!this.shipment?.pickup;
        return isPickup ? 'Listo para retirar en el local.' : 'El vendedor despachó tu paquete.';
     }

     return 'El vendedor está preparando tu paquete.';
  }

  getStatusText(): string {
      if (this.purchase?.paymentStatus === PaymentStatus.CANCELLED) return 'Compra cancelada';
      if (this.purchase?.paymentStatus === PaymentStatus.REJECTED) return 'Pago rechazado';
      if (this.purchase?.paymentStatus === PaymentStatus.PENDING && !this.isApproved()) return 'Pendiente de pago';

      if (this.isApproved()) {
          if (this.shipment?.status === Status.DELIVERED) return 'Entregado';
          if (this.shipment?.status === Status.SHIPPED) {
            const isPickup = !!this.shipment?.pickup;
            return isPickup ? 'Listo para retirar' : 'En camino';
          }
          return 'En preparación';
      }
      
      return 'En preparación';
  }

  
  getStatusColor(): string {
      if (this.purchase.paymentStatus === PaymentStatus.CANCELLED || this.purchase.paymentStatus === PaymentStatus.REJECTED){
        return 'status-red';
      }

      if ( 
          (this.purchase.paymentStatus === PaymentStatus.PENDING && !this.isApproved())) {
          return 'status-orange';
      }
      
      if (this.isApproved()) {
        return 'status-green';
      }

      if(!this.shipment) return 'status-orange';
      return this.isDelivered() ? 'status-green' : 'status-orange';
  }

  getTotalUnits(): number {
    if (!this.purchase.detailTransactions) return 0;
    return this.purchase.detailTransactions.reduce((total, transaction) => total + transaction.quantity, 0);
  }

  // Navegación
  viewPurchaseDetails() {
    this.router.navigate(['/purchase', this.purchase.id]); 
  }

  gotoDetailsProduct(id?: number){
    if(id) this.router.navigate(["/products/details", id]);
  }

  // --- LÓGICA ADMIN (CLIENT INFO) ---
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

  getClientInfo(clientId?: number){
    if (!clientId) return null
    const cache = this.clientsCache();

    if (cache.has(clientId)) return cache.get(clientId);

    this.uService.get(clientId).subscribe({
      next: (data) => {
        const clientData = {
          firstName: data.firstName, lastName: data.lastName,
          dni: data.dni, phone: data.phone, email: data.email,
        }
        cache.set(clientId, clientData);
        this.clientsCache.set(new Map(cache)) 
      }
    })
    return null;
  }
  continuePayment() {
    if (this.purchase.paymentLink) {
      window.open(this.purchase.paymentLink, '_blank');
    }
  }
}
