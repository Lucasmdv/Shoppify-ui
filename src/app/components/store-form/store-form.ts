import { Component, OnInit } from '@angular/core';
import { StoreService } from '../../services/store-service';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '../../models/store';
import Swal from 'sweetalert2';
import { RouterLink } from "@angular/router";
import { SwalService } from '../../services/swal-service';

@Component({
  selector: 'app-store-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './store-form.html',
  styleUrl: './store-form.css'
})
export class StoreForm implements OnInit {

  fg!: FormGroup;
  store!: Store

  constructor(private storeService: StoreService,

    private swalService: SwalService
  ) { }

  ngOnInit(): void {
    this.forminit()
    this.renderStore()
  }

  renderStore(){
    this.storeService.getStore().subscribe({
      next: (data) => {
        this.store = data
        this.fg.patchValue(data)
      },
      error(err) {
        Swal.fire({
          //Configurar 
        })
      },
    })
  }



  forminit(){
    this.fg = new FormGroup({
      storeName: new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]),
      address: new FormControl('', [Validators.required, Validators.maxLength(100)]),
      city: new FormControl('', [Validators.required, Validators.maxLength(100), Validators.minLength(3)]),
      postalCode: new FormControl('', [Validators.required, Validators.maxLength(20)]),
      phone: new FormControl('', [Validators.required, Validators.maxLength(20), Validators.minLength(3)]),
      facebook: new FormControl('', [Validators.maxLength(100), Validators.minLength(3)]),
      instagram: new FormControl('', [Validators.maxLength(100), Validators.minLength(3)]),
      twitter: new FormControl('', [Validators.maxLength(100), Validators.minLength(3)]),
    });
  }

 onRestore(){
    this.fg.reset()
    this.fg.patchValue(this.store)
  }
  onSubmit(){
    if(this.fg.invalid){
      this.fg.markAllAsTouched();
      return;
    }

    this.storeService.putStore(this.fg.value).subscribe({
      next: (data) => {
        this.swalService.success("Formulario actualizado correctamente")
      },

      error:(err) => {
        this.swalService.error("Hubo un error al actualizar la tienda.")
      },
    })
  }

  showErrors(controlName: string): boolean {
    const control = this.fg.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  hasError(controlName: string, errorCode: string): boolean {
    const control = this.fg.get(controlName);
    return !!control && control.hasError(errorCode);
  }


}
