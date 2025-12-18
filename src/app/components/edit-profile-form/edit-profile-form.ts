import { User } from '../../models/auth/user';
import { Component, inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-profile-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-profile-form.html',
  styleUrl: './edit-profile-form.css',
  encapsulation: ViewEncapsulation.None
})

export class EditProfileForm {
  form!: FormGroup
  private fb = inject(FormBuilder)
  private dialogRef = inject(MatDialogRef<EditProfileForm>)
  private data = inject<User>(MAT_DIALOG_DATA) //inyeccion de token de datos provenientes del perfil

  ngOnInit() {
    this.crearForm()
  }

  crearForm() {
    this.form = this.fb.group({
      firstName: [this.data.firstName, [Validators.required, Validators.minLength(2)]],
      lastName: [this.data.lastName, [Validators.required, Validators.minLength(2)]],
      dni: [this.data.dni, [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      phone: [this.data.phone, [Validators.required, Validators.pattern(/^\d+$/), Validators.minLength(7), Validators.maxLength(20)]],
      img: [this.data.img || '']
    })
  }

  guardar() {
    if (this.form.valid) {
      const updatedUser: User = {
        ...this.data,
        ...this.form.value
      };
      this.dialogRef.close(updatedUser)
    } else {
      this.form.markAllAsTouched()
    }
  }

  cancelar() {
    this.dialogRef.close()
  }
}
