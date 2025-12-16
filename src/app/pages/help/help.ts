import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { StoreService } from '../../services/store-service';
import { RouterLink } from "@angular/router";
import { BackButtonComponent } from '../../components/back-button/back-button';

@Component({
  selector: 'app-help',
  imports: [ReactiveFormsModule, RouterLink, BackButtonComponent],
  templateUrl: './help.html',
  styleUrl: './help.css'
})
export class Help implements OnInit {

  private fb = inject(FormBuilder)
  private storeService = inject(StoreService)
  store: any = {}
  showFaq = false
  showContact = false
  activeQuestion = signal<number | null>(null)
  contactForm!: FormGroup
  wpp = 'https://wa.me/'

  ngOnInit(): void {
    this.renderPage()
  }

  renderPage() {
    this.storeService.getStore().subscribe({
      next: (data) => {
        this.store = data
      },
      error: (err) => console.error('Error al cargar la tienda:', err)
    })
    this.contactForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      subject: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    })
    this.wpp += this.store.phone ? this.store.phone.replace(/\D/g, '') : ''
  }

  toggleFaq() {
    this.showFaq = !this.showFaq
  }

  toggleContact() {
    this.showContact = !this.showContact
  }

  toggleQuestion(i: number) {
    this.activeQuestion.update(current => (current === i ? null : i))
  }

  onSubmit() {
    if (this.contactForm.valid) {
      console.log('Consulta enviada:', this.contactForm.value)
      Swal.fire({
        icon: "success",
        title: "Consulta enviada",
        text: "Gracias por contactarnos. Te responderemos en breve"
      })
      this.contactForm.reset()
    }
  }
}
