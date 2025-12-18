import { Shipment, ShipmentRequest } from "./shipment";
import { Transaction } from "./transaction";

export interface SaleRequest {
  userId: number;
  transaction: TransactionRequest;
  shipment?: ShipmentRequest
}

export interface TransactionRequest {
  paymentMethod?: string;
  detailTransactions: DetailTransactionRequest[];
  description: string;
}

export interface DetailTransactionRequest {
  productID: number;
  quantity: number;
}

export interface Sale {
  id: number
  userId: number
  transaction: Transaction
  shipmentId: number
  userDni: number
}
