import { DetailTransaction } from "./detailTransaction";

export interface Transaction {
  id?: number
  clientId?: number
  total: number
  dateTime: string
  paymentMethod: string
  description: string
  type: string
  storeName: string
  detailTransactions: DetailTransaction[]
}