import { Component, inject, Input, OnInit, output } from '@angular/core';
import { ShipmentCard } from '../shipment-card/shipment-card';
import { PurchaseCard } from '../purchase-card/purchase-card';
import { Transaction } from '../../models/transaction';
import { Shipment } from '../../models/shipment';
import { SaleService } from '../../services/sale-service';
import { Sale } from '../../models/sale';
import { SwalService } from '../../services/swal-service';

@Component({
  selector: 'app-shipment-wrapper',
  imports: [ShipmentCard, PurchaseCard],
  templateUrl: './shipment-wrapper.html',
  styleUrl: './shipment-wrapper.css'
})
export class ShipmentWrapper implements OnInit {
  sale!: Sale

  @Input() shipment!: Shipment;
  @Input() index: number = 0;
  @Input() isAdmin: boolean = false;

  changeStatus = output<void>()

  saleService = inject(SaleService)
  swal = inject(SwalService)

  ngOnInit(): void {
    this.getSale()
  }

  getSale() {
    this.saleService.get(this.shipment.saleId).subscribe({
      next: data => {
        this.sale = data

        if (this.sale.transaction) {
          this.sale.transaction.userId = this.sale.userId
        }
      },
      error: error => this.swal.error("Ocurrio un problema al obtener la venta")
    })
  }
}
