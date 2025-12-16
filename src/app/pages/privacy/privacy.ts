import { Component, inject, OnInit } from '@angular/core';
import { StoreService } from '../../services/store-service';
import { BackButtonComponent } from '../../components/back-button/back-button';

@Component({
  selector: 'app-privacy',
  imports: [BackButtonComponent],
  templateUrl: './privacy.html',
  styleUrl: './privacy.css'
})
export class Privacy implements OnInit {

  storeSerice = inject(StoreService)
  wpp = ""

  ngOnInit(): void {
    this.storeSerice.getStore().subscribe((data) => {
      this.wpp = `https://wa.me/${data.phone}?text=Hola%20${data.storeName}%2C%20tengo%20una%20consulta%20sobre%20la%20pol%C3%ADtica%20de%20privacidad.`
    })
  }

}
