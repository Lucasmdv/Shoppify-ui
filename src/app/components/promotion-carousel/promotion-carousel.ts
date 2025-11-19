import { Component, Input } from '@angular/core';
import { CarouselComponent, CarouselControlComponent, CarouselIndicatorsComponent, CarouselInnerComponent, CarouselItemComponent } from '@coreui/angular';

import { Router } from '@angular/router';
import { Carouselitem } from '../../models/carouselitem';
import { ImageFallbackDirective } from '../../core/directives/image-fallback';

@Component({
  selector: 'app-promotion-carousel',
  imports: [CarouselComponent, CarouselControlComponent,CarouselInnerComponent,CarouselIndicatorsComponent,CarouselItemComponent,ImageFallbackDirective],
  templateUrl: './promotion-carousel.html',
  styleUrl: './promotion-carousel.css'
})
export class PromotionCarousel {

  constructor(private router:Router){}

  @Input() carouselItems: Carouselitem [] = []
  @Input() redirect : boolean = false

  onClick(item:Carouselitem){
    if(this.redirect){
      this.router.navigate([item.href]);
    }
  }
}
