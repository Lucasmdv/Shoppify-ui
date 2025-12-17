export interface NotificationResponse {
  id?: number;
  title: string;
  message: string;
  icon: string;
  type: string;
  rawType?: string;
  relatedProductId?: number;
  relatedSaleId?: number;
  publishAt?: string;
  expiresAt?: string;
  createdAt: string;
  isRead: boolean;
  read?: boolean;
  hidden?: boolean;
}

export interface NotificationPayload {
  title: string;
  message: string;
  icon?: string;
  type: string;
  relatedProductId?: number | null;
  relatedSaleId?: number | null;
  publishAt?: string | null;
  expiresAt?: string | null;
}
