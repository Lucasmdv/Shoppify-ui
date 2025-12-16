import { DetailTransaction } from "./detailTransaction";
import { PaymentDetail } from "./paymentDetail";

export interface Transaction {
  id?: number
  userId?: number
  total: number
  paymentStatus: string
  dateTime: string
  paymentMethod: string
  description: string
  type: string
  storeName: string
  detailTransactions: DetailTransaction[]
  paymentDetail?: PaymentDetail
}
