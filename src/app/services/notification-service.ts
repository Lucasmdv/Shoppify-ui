import { Injectable, NgZone, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, Subject } from 'rxjs';
import { NotificationResponse } from '../models/notification/notification';
import { environment } from '../../environments/environment';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private notificationSubject = new Subject<NotificationResponse>();
  private eventSource!: EventSource | EventSourcePolyfill;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private reconnectAttempts = 0;
  private currentUserId?: number;
  private shouldReconnect = false;
  private heartbeatTimer?: ReturnType<typeof setInterval>;
  private lastEventAt = 0;

  readonly API_URL = `${environment.apiUrl}/notifications/user`;

  constructor(private zone: NgZone) { }

  public connect(userId: number): void {
    this.currentUserId = userId;
    this.shouldReconnect = true;
    this.clearReconnectTimer();
    this.clearHeartbeatTimer();
    if (this.eventSource) {
      console.log('NotificationService: Closing existing connection');
      this.eventSource.close();
    }

    const token = this.authService.token();
    if (!token) {
      console.warn('NotificationService: Cannot connect SSE without token');    
      this.shouldReconnect = false;
      return;
    }

    const url = this.withNgrokBypass(`${this.API_URL}/${userId}/stream`);
    console.log('NotificationService: Connecting to SSE', url);
    this.eventSource = new EventSourcePolyfill(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });
    this.startHeartbeatMonitor();

    const handleNotification = (event: MessageEvent) => {
      this.zone.run(() => {
        console.log('NotificationService: Raw event received', event);
        try {
          if (event.type === 'keepalive' || event.data === 'keepalive') {       
            this.lastEventAt = Date.now();
            return;
          }
          const notification = this.adaptNotification(JSON.parse(event.data));  
          console.log('NotificationService: Parsed notification', notification);
          this.lastEventAt = Date.now();
          this.notificationSubject.next(notification);
        } catch (e) {
          console.error('NotificationService: Error parsing notification', e);  
        }
      });
    };

    this.eventSource.onopen = (event) => {
      console.log('NotificationService: SSE Connection Opened', event);
      this.reconnectAttempts = 0;
      this.lastEventAt = Date.now();
    };

    this.eventSource.addEventListener('notification', handleNotification);      
    this.eventSource.addEventListener('keepalive', () => {
      this.lastEventAt = Date.now();
    });
    this.eventSource.onmessage = handleNotification;

    this.eventSource.onerror = (error) => {
      console.error('NotificationService: SSE Error', error);
      if (this.eventSource.readyState === EventSource.CLOSED) {
        console.log('NotificationService: SSE Closed');
      }
      this.scheduleReconnect();
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

  public hideNotification(userId: number, notificationId: number): Observable<NotificationResponse> {
    return this.http
      .patch<NotificationResponse>(`${this.API_URL}/${userId}/hide/${notificationId}`, {})
      .pipe(map((n) => this.adaptNotification(n)));
  }

  public createNotification(notification: any): Observable<NotificationResponse> {
    const url = `${environment.apiUrl}/notifications`; // Base admin endpoint
    return this.http.post<NotificationResponse>(url, notification);
  }

  public getAllNotifications(): Observable<NotificationResponse[]> {
    const url = `${environment.apiUrl}/notifications`;
    return this.http.get<SpringPage<NotificationResponse>>(url).pipe(
      map(page => (page.content || []).map((n) => this.adaptNotification(n)))
    );
  }

  public updateNotification(id: number, notification: any): Observable<NotificationResponse> {
    const url = `${environment.apiUrl}/notifications/${id}`;
    return this.http.put<NotificationResponse>(url, notification);
  }

  public deleteNotification(id: number): Observable<void> {
    // Assuming DELETE exists standardly, if not verified by user image, but common practice.
    // If 405, we will know.
    const url = `${environment.apiUrl}/notifications/${id}`;
    return this.http.delete<void>(url);
  }

  public disconnect(): void {
    this.shouldReconnect = false;
    this.clearReconnectTimer();
    this.clearHeartbeatTimer();
    if (this.eventSource) {
      this.eventSource.close();
    }
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect || !this.currentUserId || this.reconnectTimer) {
      return;
    }

    const delay = Math.min(30000, 1000 * Math.pow(2, this.reconnectAttempts));
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      this.connect(this.currentUserId!);
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  private startHeartbeatMonitor(): void {
    this.lastEventAt = Date.now();
    this.heartbeatTimer = setInterval(() => {
      if (!this.shouldReconnect || !this.currentUserId) {
        return;
      }
      const now = Date.now();
      if (now - this.lastEventAt > 70000) {
        console.warn('NotificationService: SSE heartbeat timeout; reconnecting');
        if (this.eventSource) {
          this.eventSource.close();
        }
        this.clearReconnectTimer();
        this.scheduleReconnect();
      }
    }, 15000);
  }

  private clearHeartbeatTimer(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = undefined;
    }
  }

  private withNgrokBypass(url: string): string {
    if (url.includes('ngrok')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}ngrok-skip-browser-warning=true`;
    }
    return url;
  }

  private adaptNotification(raw: any): NotificationResponse {
    const mappedType = this.mapType(raw?.type);
    const read = raw?.read ?? raw?.isRead ?? false;
    const hidden = raw?.hidden ?? false;
    const id = raw?.id ?? raw?.notificationId;
    const expiresAt = raw?.expiresAt ?? raw?.expireAt ?? null;
    return {
      ...raw,
      id,
      type: mappedType,
      isRead: read,
      read,
      hidden,
      expiresAt
    };
  }

  private mapType(type?: string): 'general' | 'product' | 'personal' {
    switch (type) {
      case 'PRODUCT_ALERT':
        return 'product';
      case 'PERSONAL':
        return 'personal';
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
