export interface SaleRequest {
  clientId: number;
  transaction: TransactionRequest;
}

export interface TransactionRequest {
  paymentMethod: string;
  detailTransactions: DetailTransactionRequest[];
  description: string;
}

export interface DetailTransactionRequest {
  productID: number;
  quantity: number;
}