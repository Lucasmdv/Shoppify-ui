import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../services/auth-service';
import { Transaction } from '../../models/transaction';
import { CommonModule } from '@angular/common';
import { SaleService } from '../../services/sale-service';
import { SalesParams } from '../../models/filters/salesParams';
import { FormsModule } from "@angular/forms";
import Swal from 'sweetalert2';
import { UserService } from '../../services/user-service';
import { PurchaseCard } from '../../components/purchase-card/purchase-card';

@Component({
  selector: 'app-purchases',
  imports: [CommonModule, FormsModule, PurchaseCard],
  templateUrl: './purchases.html',
  styleUrl: './purchases.css'
})
export class Purchases implements OnInit {

  saleService = inject(SaleService)
  aService = inject(AuthService)
  uService = inject(UserService)
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
  filtersOpen = true

  filters: SalesParams = {
    startDate: '',
    endDate: '',
    paymentMethod: '',
    minPrice: undefined,
    maxPrice: undefined,
    userId: this.isAdmin ? '' : (this.user()?.id?.toString() ?? ''),
    page: this.currentPage,
    size: this.purchasesXPage
  }

  ngOnInit(): void {
    this.loadTransactions()
  }

  toggleFilters(): void {
    this.filtersOpen = !this.filtersOpen
  }

  toggleAdminView(): void {
    this.adminView = !this.adminView
    this.filters.userId = this.adminView ? '' : (this.user()?.id?.toString() ?? '')
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

  loadTransactions(): void {
    this.filters.page = this.currentPage
    this.filters.size = this.purchasesXPage

    const request$ = this.isAdmin
      ? this.saleService.getList(this.filters)
      : this.saleService.getMySales(this.filters)

    request$.subscribe({
      next: (data) => {
        const sales = data.data || []
        this.purchases.set(sales.map((s: any) => ({
          id: s.transaction?.id,
          total: s.transaction?.total,
          dateTime: s.transaction?.dateTime,
          paymentMethod: s.transaction?.paymentMethod,
          description: s.transaction?.description,
          type: s.transaction?.type,
          storeName: s.transaction?.storeName,
          userId: s.transaction?.userId || s.userId,
          detailTransactions: s.transaction?.detailTransactions || [],
          paymentDetail: s.transaction?.paymentDetail,
          paymentStatus: s.transaction?.paymentStatus
        })))
        console.log(this.purchases())
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

  clearFilters(): void {
    this.filters = {
      startDate: '',
      endDate: '',
      paymentMethod: '',
      minPrice: undefined,
      maxPrice: undefined,
      userId: this.adminView ? '' : this.user()?.id?.toString() ?? '',
      page: 0,
      size: this.purchasesXPage
    }
    this.currentPage = 0
    this.loadTransactions()
  }
}
