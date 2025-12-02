import { Component, inject, OnInit } from '@angular/core';
import { Shipment } from '../../models/shipment';
import { ShipmentService } from '../../services/shipment-service';
import { ShipmentCard } from '../../components/shipment-card/shipment-card';
import { AuthService } from '../../services/auth-service';
import { ShipmentsParams } from '../../models/filters/shipmentsParams';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ShipmentWrapper } from '../../components/shipment-wrapper/shipment-wrapper';

@Component({
  selector: 'app-shipments',
  imports: [ShipmentWrapper, FormsModule, CommonModule],
  templateUrl: './shipments.html',
  styleUrl: './shipments.css'
})
export class Shipments implements OnInit{
  shipments: Shipment[] = []
  adminView = false

  shipmentService = inject(ShipmentService)
  aService = inject(AuthService)
  isAdmin = this.aService.permits().includes('ADMIN')
  user = this.aService.user

  purchasesXPage = 10
  currentPage = 0
  totalPages = 1
  filters: ShipmentsParams = {
      startDate: '',
      endDate: '',
      minPrice: undefined,
      maxPrice: undefined,
      clientId: this.user()?.id?.toString() ?? '',
      status: '',
      adress: '',
      page: this.currentPage,
      size: this.purchasesXPage
    }

  ngOnInit(): void {
    this.getShipments()
  }

  toggleAdminView(): void {
    this.adminView = !this.adminView
    this.filters.clientId = this.adminView ? '' : this.user()?.id?.toString() ?? ''
    this.currentPage = 0
    this.getShipments()
  }

  applyFilters(): void {
  this.currentPage = 0
  this.filters.page = this.currentPage
  this.filters.size = this.purchasesXPage
  this.getShipments()
}

changePage(page: number): void {
  if (page < 0 || page >= this.totalPages) return
  this.currentPage = page
  this.filters.page = this.currentPage
  this.getShipments()
}

clearFilters(): void {
  this.filters = {
    startDate: '',
    endDate: '',
    minPrice: undefined,
    maxPrice: undefined,
    clientId: this.adminView ? '' : this.user()?.id?.toString() ?? '',
    status: '',
    adress: '',
    page: 0,
    size: this.purchasesXPage
  }

  this.currentPage = 0
  this.getShipments()
}

  getShipments() {
    this.filters.page = this.currentPage
    this.filters.size = this.purchasesXPage

    const cleanedFilters: any = {}

    Object.keys(this.filters).forEach(key => {
      const value = (this.filters as any)[key]
      if (value !== undefined && value !== null && value !== '') {
        cleanedFilters[key] = value
      }
    })
    
    this.shipmentService.getList(cleanedFilters).subscribe({
      next: data => {
        this.shipments = data.data
        this.totalPages = data.page?.totalPages || 1
        console.log(this.filters)
      }
    })
  }
}
