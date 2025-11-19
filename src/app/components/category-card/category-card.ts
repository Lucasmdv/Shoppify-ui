import { Component, Input } from '@angular/core';
import { Category } from '../../models/category';
import { Router } from '@angular/router';
import { ImageFallbackDirective } from '../../core/directives/image-fallback';

@Component({
  selector: 'app-category-card',
  imports: [ImageFallbackDirective],
  templateUrl: './category-card.html',
  styleUrl: './category-card.css'
})
export class CategoryCard {

constructor(private router:Router){}

@Input() category!:Category

getDetails(name:string){
 
    this.router.navigate(['/products'], {
      queryParams: {
        page: 0,
        size: 8,
        categories:name
      },
    })
  }

}
