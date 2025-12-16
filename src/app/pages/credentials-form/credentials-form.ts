import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth-service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { catchError, map, of } from 'rxjs';
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
      email: [this.authService.user()?.email, [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      confirmPassword: ['', [], [this.passwordMatchValidator()]]
    })
  }

  get email() { return this.accountForm.get('email')! }
  get password() { return this.accountForm.get('password')! }
  get confirmPassword() { return this.accountForm.get('confirmPassword')! }

  passwordMatchValidator(): AsyncValidatorFn {
    return (control: AbstractControl) => {
      const form = control.parent as FormGroup
      if (!form) return of(null)

      const currentPassword = control.value
      const user = this.authService.user()

      if (!currentPassword || !user?.email) return of(null)

      const credentials = { email: user.email, password: currentPassword }

      return this.authService.login(credentials).pipe(
        map(() => null),
        catchError(() => of({ passwordMismatch: true }))
      )
    }
  }


  onSubmit() {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched()
      return
    }

    const newEmail = this.email.value !== this.authService.user()?.email ? this.email.value : undefined
    const newPassword = this.password.value || undefined

    this.authService.updateCredential(newEmail, newPassword).subscribe({
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
}
