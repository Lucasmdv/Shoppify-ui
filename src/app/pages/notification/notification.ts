import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from '../../services/notification-service';
import Swal from 'sweetalert2';
import { NotificationResponse, NotificationPayload } from '../../models/notification/notification';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-notification',
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule
  ],
  templateUrl: './notification.html',
  styleUrl: './notification.css'
})
export class Notification implements OnInit {

  notifications: NotificationResponse[] = [];
  selectedItem?: NotificationResponse;
  fg!: FormGroup;
  minDate = new Date(); // For datepicker

  constructor(
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadHistory();
  }

  loadHistory() {
    this.notificationService.getAllNotifications().subscribe({
      next: (res) => {
        this.notifications = res.sort((a, b) => (b.id || 0) - (a.id || 0)); 
      },
      error: (err) => console.error('Error loading history', err)
    });
  }

  initForm() {
    this.fg = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(120)]],
      message: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(500)]],
      type: ['GLOBAL', [Validators.required]],
      deliveryMode: ['immediate'], 
      
      publishStart: [null],
      publishEnd: [null],

      immediateExpireDate: [null],
      
      startTime: [''],
      endTime: [''],
      
      relatedProductId: [null],
    });
  }

  createItem() {
    this.selectedItem = undefined;
    this.fg.reset({ type: 'GLOBAL', deliveryMode: 'immediate' });
  }

  onPreviewSelect(item: NotificationResponse) {
    this.selectedItem = item;
    
    let pStart = null;
    let sTime = '';
    if (item.publishAt) {
      const dateObj = new Date(item.publishAt);
      pStart = dateObj;
      const hours = dateObj.getHours().toString().padStart(2, '0');
      const mins = dateObj.getMinutes().toString().padStart(2, '0');
      sTime = `${hours}:${mins}`;
    }

    // Parse expiresAt
    let pEnd = null; // for scheduled
    let iExpire = null; // for immediate
    let eTime = '';

    if (item.expiresAt) {
       const dateObj = new Date(item.expiresAt);
       const hours = dateObj.getHours().toString().padStart(2, '0');
       const mins = dateObj.getMinutes().toString().padStart(2, '0');
       eTime = `${hours}:${mins}`;
       
       pEnd = dateObj;
       iExpire = dateObj;
    }

    this.fg.patchValue({
      title: item.title,
      message: item.message,
      type: item.type || 'GLOBAL',
      deliveryMode: 'scheduled', // Default to showing as scheduled so they see start/end clearly
      publishStart: pStart,
      publishEnd: pEnd,
      immediateExpireDate: iExpire, 
      startTime: sTime,
      endTime: eTime
    });
  }

  resetCurrent() {
    this.fg.reset({ type: 'GLOBAL', deliveryMode: 'immediate' });
    this.selectedItem = undefined;
  }

  onSubmit() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }

    const val = this.fg.value;
    const mode = val.deliveryMode;
    
    let publishAt = null;
    let expiresAt = null;

    if (mode === 'immediate') {
      const now = new Date();
      publishAt = now.toISOString();
      
      if (val.immediateExpireDate) {
        const date = new Date(val.immediateExpireDate);
        if (val.endTime) {
           const [hours, minutes] = val.endTime.split(':');
           date.setHours(+hours);
           date.setMinutes(+minutes);
        } else {
           date.setHours(23, 59, 59);
        }
        expiresAt = date.toISOString();
      }
    } else {
      if (val.publishStart) {
        const date = new Date(val.publishStart); 
        if (val.startTime) {
          const [hours, minutes] = val.startTime.split(':');
          date.setHours(+hours);
          date.setMinutes(+minutes);
        }
        publishAt = date.toISOString();
      }

      if (val.publishEnd) {
        const date = new Date(val.publishEnd);
        if (val.endTime) {
           const [hours, minutes] = val.endTime.split(':');
           date.setHours(+hours);
           date.setMinutes(+minutes);
        } else {
           date.setHours(23, 59, 59);
        }
        expiresAt = date.toISOString();
      }
    }

    const payload: NotificationPayload = {
      title: val.title,
      message: val.message,
      type: 'GLOBAL',
      publishAt: publishAt,
      expiresAt: expiresAt,
      relatedProductId: val.relatedProductId
    };

    if (this.selectedItem && this.selectedItem.id) {
       this.notificationService.updateNotification(this.selectedItem.id, payload).subscribe({
         next: (res) => {
           Swal.fire({
             toast: true,
             position: 'bottom-end',
             showConfirmButton: false,
             timer: 4000,
             timerProgressBar: true,
             icon: 'success',
             title: 'Notificación actualizada'
           });
           this.loadHistory();
         },
         error: (err) => {
           console.error(err);
           Swal.fire({
             toast: true,
             position: 'bottom-end',
             showConfirmButton: false,
             timer: 5000,
             timerProgressBar: true,
             icon: 'error',
             title: 'Error al actualizar'
           });
         }
       });
    } else {
       this.notificationService.createNotification(payload).subscribe({
        next: (res) => {
          Swal.fire({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            icon: 'success',
            title: 'Notificación enviada'
          });
          this.resetCurrent();
          this.loadHistory();
        },
        error: (err) => {
          console.error(err);
          Swal.fire({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
            icon: 'error',
            title: 'Error al crear notificación'
          });
        }
      });
    }
  }

  onDelete() {
    if (!this.selectedItem || !this.selectedItem.id) return;
    const notificationId = this.selectedItem.id;
    Swal.fire({
      title: 'Eliminar notificación',
      text: '¿Eliminar esta notificación del historial?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }
      this.notificationService.deleteNotification(notificationId).subscribe({
        next: () => {
          Swal.fire({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            icon: 'success',
            title: 'Notificación eliminada'
          });
          this.resetCurrent();
          this.loadHistory();
        },
        error: (err) => {
           console.error(err);
           Swal.fire({
             toast: true,
             position: 'bottom-end',
             showConfirmButton: false,
             timer: 5000,
             timerProgressBar: true,
             icon: 'error',
             title: 'Error al eliminar'
           });
        }
      });
    });
  }

  goBack() {
    this.router.navigate(['/auth', 'admin']);
  }

  showErrors(controlName: string): boolean {
    const control = this.fg.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }


  getStatus(item: NotificationResponse): 'active' | 'scheduled' | 'expired' {
    const now = new Date();
    
    if (item.expiresAt) {
      const expirationDate = new Date(item.expiresAt);
      if (expirationDate < now) {
        return 'expired';
      }
    }

    if (item.publishAt) {
      const publishDate = new Date(item.publishAt);
      if (publishDate > now) {
        return 'scheduled';
      }
    }

    return 'active';
  }
}
