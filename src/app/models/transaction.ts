import { DetailTransaction } from "./detailTransaction";
import { PaymentDetail } from "./paymentDetail";

export interface Transaction {
  id?: number
  userId?: number
  total: number
  paymentStatus: PaymentStatus
  dateTime: string
  paymentMethod: string
  description: string
  type: string
  storeName: string
  detailTransactions: DetailTransaction[]
  paymentDetail?: PaymentDetail
}

export enum PaymentStatus {
    APPROVED = 'APPROVED',
    PENDING = 'PENDING',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED'
}

