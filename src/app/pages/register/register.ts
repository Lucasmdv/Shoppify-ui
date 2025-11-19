import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import { RegisterPayload } from '../../models/auth/registerPayload';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {
  private readonly usernamePattern = /^[A-Za-z0-9._-]+$/;
  private readonly namePattern = /^[\p{L}\s]+$/u;
  private readonly dniPattern = /^[0-9]{8}$/;
  private readonly phonePattern = /^[0-9]{7,20}$/;

  fg!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.fg = this.fb.group({
      //Credentials
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
      username: ['', [
        Validators.required,
        Validators.minLength(4),
        Validators.maxLength(50),
        Validators.pattern(this.usernamePattern)
      ]],

      //User
      firstName: ['', [
        Validators.required,
        Validators.maxLength(20),
        Validators.pattern(this.namePattern)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.maxLength(20),
        Validators.pattern(this.namePattern)
      ]],

      dni: ['', [Validators.required, Validators.pattern(this.dniPattern)]],
      phone: ['', [Validators.required, Validators.pattern(this.phonePattern)]],

    });
  }

  onsubmit() {
    if (this.fg.invalid) {
      this.fg.markAllAsTouched();
      return;
    }
    this.register()
  }

  register() {
    const { firstName, lastName, dni, phone, email, password, username } = this.fg.value;

    const register: RegisterPayload = {
      user: { firstName, lastName, dni, phone, email },
      credentials: { email, password, username }
    };

    this.authService.register(register).subscribe({
      next: (res) => {
        Swal.fire({
          title: 'Registro exitoso 🎉',
          text: 'Tu cuenta fue creada correctamente.',
          icon: 'success',
          background: '#f7f7f8',
          color: 'black'
        })

        this.authService.setSession(res.token, Array.from(res.permits), res.user)
        this.router.navigate(['/'])
      },
      error(err) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: err.error.message,
          iconColor: '#6141e8',
          background: "#f7f7f8"
        });
      },
    })
  }

  hasError(controlName: string, errorCode: string): boolean {
    const control = this.fg.get(controlName);
    return !!control && control.hasError(errorCode) && (control.dirty || control.touched);
  }

  showErrors(controlName: string): boolean {
    const control = this.fg.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

}
