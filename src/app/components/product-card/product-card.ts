import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Product } from '../../models/product';
import { Router } from '@angular/router';
import { ImageFallbackDirective } from '../../core/directives/image-fallback';

@Component({
  selector: 'app-product-card',
  imports: [CurrencyPipe, DecimalPipe, ImageFallbackDirective],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard {

@Input() product!: Product
@Input() isMostrarStock: boolean = false
@Input() isMostrarCuotas: boolean = false
@Input() isMostrarDescuento: boolean = false
@Input() isMostrarDescripcion: boolean = false
@Input() isNavegar: boolean = true
@Input() layout: 'card' | 'horizontal' = 'card'
constructor(private router:Router){}

getDetails(id: number){
  if(this.isNavegar){
  this.router.navigate(["/products/details", id]);
  }
 
}

get hasDiscount(){
  return this.product.discountPercentage > 0
}

get isHorizontal(){
  return this.layout === 'horizontal'
}
}

