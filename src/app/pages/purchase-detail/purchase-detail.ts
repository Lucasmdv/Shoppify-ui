import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuditService } from '../../services/audit-service';
import { ShipmentService } from '../../services/shipment-service';
import { Transaction, PaymentStatus } from '../../models/transaction';
import { Shipment, Status } from '../../models/shipment';
import { ShipmentStepper } from '../../components/shipment-stepper/shipment-stepper';

@Component({
  selector: 'app-purchase-detail',
  standalone: true,
  imports: [CommonModule, DatePipe,ShipmentStepper],
  templateUrl: './purchase-detail.html',
  styleUrl: './purchase-detail.css'
})
export class PurchaseDetail implements OnInit {
  
  route = inject(ActivatedRoute);
  router = inject(Router);
  aService = inject(AuditService);
  sService = inject(ShipmentService);

  purchaseId: number | null = null;
  purchase: Transaction | null = null;
  shipment: Shipment | null = null;
  
  Status = Status; 
  PaymentStatus = PaymentStatus;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.purchaseId = +id;
        this.loadPurchaseData();
      }
    });
  }

  loadPurchaseData() {
    if (!this.purchaseId) return;

    this.aService.get(this.purchaseId).subscribe({
      next: (data: any) => {
        this.purchase = {
           id: data.transaction?.id,
           total: data.transaction?.total,
           dateTime: data.transaction?.dateTime,
           paymentMethod: data.transaction?.paymentMethod,
           description: data.transaction?.description,
           type: data.transaction?.type,
           storeName: data.transaction?.storeName,
           userId: data.transaction?.userId || data.userId,
           detailTransactions: data.transaction?.detailTransactions || [],
           paymentStatus: data.transaction?.paymentStatus, 
           paymentDetail: data.transaction?.paymentDetail
        };
        
        // After purchase is loaded, try to load shipment
        this.loadShipmentData();
      },
      error: (err: any) => {console.error('Error loading purchase', err) 
      this.router.navigate(["/purchases"]);}
      
    });
  }

  loadShipmentData() {
     if (!this.purchaseId) return;
     this.sService.get(this.purchaseId).subscribe({
        next: (data) => this.shipment = data,
        error: () => console.log('Shipment not found for purchasing ' + this.purchaseId)
     });
  }

  // --- Status Logic ---

  getMainStatusMessage(): string {
     // 1. Payment Errors/Warnings
     if (this.purchase?.paymentStatus === PaymentStatus.CANCELLED) {
       return 'Venció el plazo para pagar tu compra';
     }
     if (this.purchase?.paymentStatus === PaymentStatus.REJECTED) {
       return 'Hubo un problema con tu pago';
     }
     if (this.purchase?.paymentStatus === PaymentStatus.PENDING) {
       return 'Esperando confirmación del pago';
     }

     // 2. Shipment Success/Active
     if (this.shipment?.status === Status.DELIVERED) {
       return 'Llegó el ' + (this.shipment.endDate ? new Date(this.shipment.endDate).toLocaleDateString() : '');
     }
     if (this.shipment?.status === Status.SHIPPED) {
        return 'Llega el ' + (this.shipment.endDate ? new Date(this.shipment.endDate).toLocaleDateString() : '');
     }

     return 'En preparación'; 
  }

  getStatusTitle(): string {
      if (this.purchase?.paymentStatus === PaymentStatus.CANCELLED) return 'Compra cancelada';
      if (this.purchase?.paymentStatus === PaymentStatus.REJECTED) return 'Pago rechazado';
      if (this.purchase?.paymentStatus === PaymentStatus.PENDING) return 'Pendiente de pago';
      
      
      if (this.shipment?.status === Status.DELIVERED) return 'Entregado';
      if (this.shipment?.status === Status.SHIPPED) return 'En camino';
      
      return 'En preparación';
  }

  // --- Helper Colors ---
  
  isRedStatus(): boolean {
    return this.purchase?.paymentStatus === PaymentStatus.CANCELLED ||
           this.purchase?.paymentStatus === PaymentStatus.REJECTED;
  }

  isGreenStatus(): boolean {
     return this.shipment?.status === Status.DELIVERED;
  }
  
  // --- Navigation ---
  
  goBack() {
    this.router.navigate(['/purchases']);
  }

  goToProduct(id?: number) {
     if(id) this.router.navigate(['/products/details', id]);
  }
}
