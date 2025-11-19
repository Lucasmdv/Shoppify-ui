import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { StoreService } from '../../services/store-service';

@Component({
  selector: 'app-footer-auth',
  imports: [RouterLink],
  templateUrl: './footer-auth.html',
  styleUrl: './footer-auth.css'
})
export class FooterAuth implements OnInit{

  storeService = inject(StoreService)
  store?: any
  wpp: string = ""

  ngOnInit(){
    this.renderFooter()
  }

  renderFooter(){
    this.storeService.getStore().subscribe({
      next:(value) => {
        this.store = value
        this.wpp = `https://wa.me/${this.store.phone}?text=Hola%20${this.store.name}%2C%20necesito%20ayuda%20con...`
      },
    })
  }
}
