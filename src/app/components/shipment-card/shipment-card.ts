import { Component, inject, Inject, Input, NgModule, OnInit, output } from '@angular/core';
import { Shipment } from '../../models/shipment';
import { Sale } from '../../models/sale';
import { ShipmentService } from '../../services/shipment-service';
import { SaleService } from '../../services/sale-service';
import { SwalService } from '../../services/swal-service';
import { PurchaseCard } from '../purchase-card/purchase-card';
import { BgColorDirective, ButtonDirective } from "@coreui/angular";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shipment-card',
  imports: [BgColorDirective, ButtonDirective, CommonModule, FormsModule],
  templateUrl: './shipment-card.html',
  styleUrl: './shipment-card.css',
  standalone: true
})
export class ShipmentCard {
  @Input() showPurchaseCard!: boolean

  statusLabels: Record<string, string> = {
    PROCESSING: "Procesando",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
    RETURNED: "Devuelto",
  };

  statusClasses: Record<string, string> = {
    PROCESSING: "status-processing",
    SHIPPED: "status-shipped",
    DELIVERED: "status-delivered",
    CANCELLED: "status-cancelled",
    RETURNED: "status-returned",
  };

  @Input() shipment!: Shipment
  @Input() isAdmin!: boolean

  changeStatus = output<void>()

  shipmentService = inject(ShipmentService)
  swal = inject(SwalService)

  updateStatus(status: string) {
    this.shipmentService.updateStatus(status, this.shipment.id).subscribe({
      next: () => {this.changeStatus.emit()},
      error: () => this.swal.error("Ocurrio un problema al cambiar el estado del pedido") 
    })
    this.changeStatus.emit()
  }

  cancelShipment() {
    this.shipmentService.updateStatus("CANCELLED", this.shipment.id).subscribe({
      next: () => {this.swal.success("Se cancelo el pedido"), this.changeStatus.emit()},
      error: () => this.swal.error("Ocurrio un problema al cancelar el pedido") 
    })
  }

  returnShipment() {
    this.shipmentService.updateStatus("RETURNED", this.shipment.id).subscribe({
      next: () => {this.swal.success("Se devolvio el pedido"), this.changeStatus.emit()},
      error: () => this.swal.error("Ocurrio un problema al devolver el pedido") 
    })
  }

  getStatusLabel(status: string): string {
    return this.statusLabels[status] ?? "";
  }

  getStatusClass(status: string): string {
    return this.statusClasses[status] ?? "";
  }
}