import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Transaction } from '../../models/transaction';
import { CommonModule } from '@angular/common';
import { AuditService } from '../../services/audit-service';
import { SalesParams } from '../../models/filters/salesParams';
import { FormsModule } from "@angular/forms";
import Swal from 'sweetalert2';
import { ImageFallbackDirective } from '../../core/directives/image-fallback';
import { Router } from '@angular/router';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-purchases',
  imports: [CommonModule, FormsModule,ImageFallbackDirective],
  templateUrl: './purchases.html',
  styleUrl: './purchases.css'
})
export class Purchases implements OnInit {

  AService = inject(AuditService)
  aService = inject(AuthService)
  uService = inject(UserService)
  router = inject(Router)
  user = this.aService.user
  isAdmin = this.aService.permits().includes('ADMIN')

  purchases = signal<Transaction[]>([])
  activePurchase = signal<number | null>(null)
  clientsCache = signal<Map<number, any>>(new Map())
  clientsExpanded = signal<Set<number>>(new Set())

  adminView = false
  purchasesXPage = 10
  currentPage = 0
  totalPages = 1

  filters: SalesParams = {
    startDate: '',
    endDate: '',
    paymentMethod: '',
    minPrice: undefined,
    maxPrice: undefined,
    clientId: this.user()?.id?.toString() ?? '',
    page: this.currentPage,
    size: this.purchasesXPage
  }

  ngOnInit(): void {
    this.loadTransactions()
  }

  toggleAdminView(): void {
    this.adminView = !this.adminView
    this.filters.clientId = this.adminView ? '' : this.user()?.id?.toString() ?? ''
    this.currentPage = 0
    this.loadTransactions()
  }

  applyFilters(): void {
    this.currentPage = 0
    this.filters.page = this.currentPage
    this.filters.size = this.purchasesXPage
    this.loadTransactions()
  }

   changePage(page: number): void {
    if (page < 0 || page >= this.totalPages) return
    this.currentPage = page
    this.filters.page = this.currentPage
    this.filters.size = this.purchasesXPage
    this.loadTransactions()
  }

  toggleDetails(i: number): void {
    this.activePurchase.set(this.activePurchase() === i ? null : i)
  }

  loadTransactions(): void {
    this.filters.page = this.currentPage
    this.filters.size = this.purchasesXPage

    this.AService.getAllTransactions(this.filters).subscribe({
      next: (data) => {
        const sales = data._embedded?.saleResponseList || []
        this.purchases.set(sales.map((s: any) => ({
          id: s.transaction?.id,
          total: s.transaction?.total,
          dateTime: s.transaction?.dateTime,
          paymentMethod: s.transaction?.paymentMethod,
          description: s.transaction?.description,
          type: s.transaction?.type,
          storeName: s.transaction?.storeName,
          clientId: s.transaction?.clientId || s.clientId,
          detailTransactions: s.transaction?.detailTransactions || []
        })))

        this.totalPages = data.page?.totalPages || 1
      },
      error: (err) => {
        console.error('Error al cargar compras :c', err)
        Swal.fire({
          icon: 'error',
          title: 'Ops..',
          text: 'Ocurrió un error al cargar las compras. Por favor, inténtalo de nuevo más tarde.',
        })
      }
    })
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

  clearFilters(): void {
    this.filters = {
      startDate: '',
      endDate: '',
      paymentMethod: '',
      minPrice: undefined,
      maxPrice: undefined,
      clientId: this.adminView ? '' : this.user()?.id?.toString() ?? '',
      page: 0,
      size: this.purchasesXPage
    }
    this.currentPage = 0
    this.loadTransactions()
  }
}
