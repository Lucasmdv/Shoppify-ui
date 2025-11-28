import { Injectable, NgZone, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, Subject } from 'rxjs';
import { NotificationResponse } from '../models/notification/notification';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private http = inject(HttpClient);
  private notificationSubject = new Subject<NotificationResponse>();
  private eventSource!: EventSource;

  readonly API_URL = `${environment.apiUrl}/notifications/user`;

  constructor(private zone: NgZone) { }

  public connect(userId: number): void {
    if (this.eventSource) {
      console.log('NotificationService: Closing existing connection');
      this.eventSource.close();
    }

    const url = `${this.API_URL}/${userId}/stream`;
    console.log('NotificationService: Connecting to SSE', url);
    this.eventSource = new EventSource(url);

    const handleNotification = (event: MessageEvent) => {
      this.zone.run(() => {
        console.log('NotificationService: Raw event received', event);
        try {
          const notification = this.adaptNotification(JSON.parse(event.data));
          console.log('NotificationService: Parsed notification', notification);
          this.notificationSubject.next(notification);
        } catch (e) {
          console.error('NotificationService: Error parsing notification', e);
        }
      });
    };

    this.eventSource.onopen = (event) => {
      console.log('NotificationService: SSE Connection Opened', event);
    };

    this.eventSource.addEventListener('notification', handleNotification);
    this.eventSource.onmessage = handleNotification;

    this.eventSource.onerror = (error) => {
      console.error('NotificationService: SSE Error', error);
      if (this.eventSource.readyState === EventSource.CLOSED) {
        console.log('NotificationService: SSE Closed');
      }
    };
  }

  public getNotifications(): Observable<NotificationResponse> {
    return this.notificationSubject.asObservable();
  }

  public loadUserNotifications(userId: number, size: number = 20): Observable<NotificationResponse[]> {
    const params = { size: size.toString(), sort: 'createdAt,desc' };
    return this.http.get<SpringPage<NotificationResponse>>(`${this.API_URL}/${userId}`, { params }).pipe(
      map((page) => (page?.content || []).map((n) => this.adaptNotification(n)))
    );
  }

  public markAsRead(userId: number, notificationId: number): Observable<NotificationResponse> {
    return this.http
      .patch<NotificationResponse>(`${this.API_URL}/${userId}/read/${notificationId}`, {})
      .pipe(map((n) => this.adaptNotification(n)));
  }

  public disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }

  private adaptNotification(raw: any): NotificationResponse {
    const mappedType = this.mapType(raw?.type);
    const read = raw?.read ?? raw?.isRead ?? false;
    const id = raw?.id ?? raw?.notificationId;
    return {
      ...raw,
      id,
      type: mappedType,
      isRead: read,
      read
    };
  }

  private mapType(type?: string): 'general' | 'product' {
    switch (type) {
      case 'PRODUCT_ALERT':
        return 'product';
      case 'PERSONAL':
      case 'GLOBAL':
      default:
        return 'general';
    }
  }
}

interface SpringPage<T> {
  content: T[];
  pageable: any;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
