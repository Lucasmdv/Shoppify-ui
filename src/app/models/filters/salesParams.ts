
export interface SalesParams {
  saleId?: string;
  userId?: string;
  transactionId?: string;
  page?: number;
  size?: number;
  startDate: string | null;
  endDate: string | null;
  paymentMethod?: string;
  minPrice?: number;
  maxPrice?: number;
}