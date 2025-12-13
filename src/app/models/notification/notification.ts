export interface NotificationResponse {
  id?: number;
  title: string;
  message: string;
  icon: string;
  type: string;
  relatedProductId?: number;
  publishAt?: string;
  createdAt: string;
  isRead: boolean;
  read?: boolean;
  hidden?: boolean;
}
