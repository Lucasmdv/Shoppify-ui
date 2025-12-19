import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { BackButtonComponent } from '../../components/back-button/back-button';

@Component({
  selector: 'app-credentials-form',
  imports: [CommonModule, ReactiveFormsModule, BackButtonComponent],
  templateUrl: './credentials-form.html',
  styleUrl: './credentials-form.css'
})
export class CredentialsForm implements OnInit {

  private authService = inject(AuthService)
  private fb = inject(FormBuilder)
  private router = inject(Router)
  accountForm!: FormGroup

  ngOnInit(): void {
    this.accountForm = this.fb.group({
      email: [this.authService.user()?.email, [Validators.required, Validators.email, Validators.maxLength(255)]],
      password: ['', [Validators.minLength(8), Validators.maxLength(100)]],
      confirmPassword: ['']
    })
    this.accountForm.valueChanges.subscribe(() => this.updateCurrentPasswordValidator())
    this.updateCurrentPasswordValidator()
  }

  get email() { return this.accountForm.get('email')! }
  get password() { return this.accountForm.get('password')! }
  get confirmPassword() { return this.accountForm.get('confirmPassword')! }

  onSubmit() {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched()
      return
    }

    const newEmail = this.email.value !== this.authService.user()?.email ? this.email.value : undefined
    const newPassword = this.password.value || undefined
    const currentPassword = this.confirmPassword.value || undefined

    if (!newEmail && !newPassword) {
      Swal.fire({
        icon: 'info',
        title: 'Sin cambios',
        text: 'No hay cambios para guardar.',
        background: '#f7f7f8',
      })
      return
    }

    this.authService.updateCredential(newEmail, newPassword, currentPassword).subscribe({
      next: () => {
        Swal.fire({
          title: 'Datos actualizados',
          text: 'Tus credenciales se actualizaron correctamente. Por seguridad, vuelve a iniciar sesión.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
          background: '#f7f7f8',
        }).then(() => {
          this.authService.logout()
          this.router.navigate(['/auth/login'])
        })
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al actualizar',
          text: err.error?.message || 'Ocurrió un problema al actualizar tus datos',
          background: '#f7f7f8',
        })
      }
    })
  }

  private updateCurrentPasswordValidator() {
    const emailChanged = this.email.value !== this.authService.user()?.email
    const passwordChanged = !!this.password.value
    const needsCurrent = emailChanged || passwordChanged

    if (needsCurrent) {
      this.confirmPassword.setValidators([Validators.required])
    } else {
      this.confirmPassword.clearValidators()
    }
    this.confirmPassword.updateValueAndValidity({ emitEvent: false })
  }
}
