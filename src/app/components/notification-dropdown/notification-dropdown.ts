import { Component, OnInit, OnDestroy, inject, effect, ViewChild } from '@angular/core';
import { DropdownComponent, DropdownMenuDirective, DropdownToggleDirective, BadgeComponent } from '@coreui/angular';
import { NotificationService } from '../../services/notification-service';
import { AuthService } from '../../services/auth-service';
import { NotificationResponse } from '../../models/notification/notification';
import Swal from 'sweetalert2';
import { Subject, takeUntil } from 'rxjs';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [DropdownComponent, DropdownMenuDirective, BadgeComponent, DropdownToggleDirective, DatePipe],
  templateUrl: './notification-dropdown.html',
  styleUrl: './notification-dropdown.css'
})
export class NotificationDropdown implements OnInit, OnDestroy {

  @ViewChild(DropdownComponent) dropdown?: DropdownComponent;
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();
  private currentUserId?: number;

  notificationType: string = 'general';
  notifications: NotificationResponse[] = [];
  selectedNotifications: NotificationResponse[] = [];

  constructor() {
    effect(() => {
      const user = this.authService.user();
      console.log('NotificationDropdown: User state changed', user);
      if (user && user.id) {
        console.log('NotificationDropdown: Connecting for user', user.id);      
        if (this.currentUserId !== user.id) {
          this.currentUserId = user.id;
          this.loadNotificationsForUser(user.id);
        }
        this.notificationService.connect(user.id);
      } else {
        console.log('NotificationDropdown: Disconnecting');
        this.currentUserId = undefined;
        this.clearNotifications();
        this.loadGlobalNotifications();
        this.notificationService.disconnect();
      }
    });
  }

  ngOnInit() {
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe((notification) => {
        console.log('NotificationDropdown: Received notification', notification);
        this.handleNewNotification(notification);
      });

    this.updateSelectedNotifications();
  }

  ngOnDestroy() {
    this.notificationService.disconnect();
    this.destroy$.next();
    this.destroy$.complete();
  }

  handleNewNotification(notification: NotificationResponse) {
    this.addNotification(notification);
    this.updateSelectedNotifications();

    const toast = Swal.mixin({
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 8 * 1000,
      showCloseButton: true,
      timerProgressBar: true,
    });

    toast.fire({
      title: notification.title,
      text: notification.message,
      icon: 'info',
      didOpen: (toastEl) => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
        audio.play();
        if (notification.relatedProductId) {
          toastEl.addEventListener('click', () => {
            this.router.navigate(['/products/details', notification.relatedProductId]);
          });
        } else if (notification.relatedSaleId) {
          toastEl.addEventListener('click', () => {
            this.router.navigate(['/purchase', notification.relatedSaleId]);
          });
        }
      }
    });
  }

  hideNotification(notification: NotificationResponse, event?: Event) {
    event?.stopPropagation();
    if (!this.currentUserId || !notification.id) return;

    const previous = [...this.notifications];
    this.notifications = this.notifications.filter((n) => n.id !== notification.id);
    this.updateSelectedNotifications();

    this.notificationService
      .hideNotification(this.currentUserId, notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (error) => {
          console.error('NotificationDropdown: Error hiding notification', error);
          this.notifications = previous;
          this.updateSelectedNotifications();
        }
      });
  }

  updateSelectedNotifications() {
    if (this.notificationType === 'general') {
      this.getGeneralNotifications();
    } else {
      this.getProductNotifications();
    }
  }

  getGeneralNotifications() {
    this.notificationType = 'general';
    this.selectedNotifications = this.notifications.filter((n) => n.type === 'general' || n.type === 'personal' || !n.type);
  }

  getProductNotifications() {
    this.notificationType = 'product';
    this.selectedNotifications = this.notifications.filter((n) => n.type === 'product');
  }

  getUnreadNotifications() {
    return this.notifications.filter((n) => !n.isRead).length;
  }

  markNotificationAsRead(notification: NotificationResponse) {
    if (!notification) return;
    const targetProductId = notification.relatedProductId ?? null;
    this.notifications = this.notifications.map((n) =>
      n === notification || n.id === notification.id ? { ...n, isRead: true, read: true } : n
    );
    this.updateSelectedNotifications();

    if (!this.currentUserId || !notification.id) return;

    this.notificationService.markAsRead(this.currentUserId, notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updated) => {
          this.notifications = this.notifications.map((n) =>
            n.id === updated.id ? { ...n, isRead: updated.isRead, read: updated.read } : n
          );
          this.updateSelectedNotifications();
        },
        error: (error) => {
          console.error('NotificationDropdown: Error marking notification as read', error);
        }
      });
    if (targetProductId !== null) {
      this.closeDropdown();
      this.router.navigate(['/products/details', targetProductId]);
    }
    else if (notification.relatedSaleId) {
      this.closeDropdown();
      this.router.navigate(['/purchase', notification.relatedSaleId]);
      
    }
  }

  private loadNotificationsForUser(userId: number) {
    this.notificationService.loadUserNotifications(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.updateSelectedNotifications();
        },
        error: (error) => console.error('NotificationDropdown: Error loading notifications', error)
      });
  }

  private addNotification(notification: NotificationResponse) {
    const alreadyExists = notification.id
      ? this.notifications.some((n) => n.id === notification.id)
      : false;

    if (!alreadyExists) {
      this.notifications.unshift(notification);
    }
  }

  private clearNotifications() {
    this.notifications = [];
    this.selectedNotifications = [];
    this.notificationType = 'general';
  }

  private loadGlobalNotifications() {
    this.notificationService.getAllNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.updateSelectedNotifications();
        },
        error: (error) => console.error('NotificationDropdown: Error loading global notifications', error)
      });
  }

  private closeDropdown() {
    this.dropdown?.setVisibleState(false);
  }
}
