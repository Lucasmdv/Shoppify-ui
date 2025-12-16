export interface PaymentDetail {
  paymentId?: string;
  status?: string;
  statusDetail?: string;
  paymentMethodId?: string;
  paymentTypeId?: string;
  issuerId?: string;
  installments?: number;
  cardLastFour?: string;
  cardholderName?: string;
  statementDescriptor?: string;
  transactionAmount?: number;
  netReceivedAmount?: number;
  payerEmail?: string;
  payerId?: string;
  dateApproved?: string;
  dateCreated?: string;
}
