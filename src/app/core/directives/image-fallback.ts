import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({

 selector: 'img:not([disable-errorHandler])',
  standalone: true, 
})
export class ImageFallbackDirective {

  readonly url = "https://placehold.co/600x400?text="; 
  @Input() name!: string
  private attemptedFallback = false;

  constructor(private el: ElementRef<HTMLImageElement>) {}


  @HostListener('error')
  loadFallbackOnError() {
    if (this.attemptedFallback) {
      return; 
    }
    this.attemptedFallback = true;

    const element = this.el.nativeElement;
    console.warn(`Image not found: ${element.src}. Using placeholder.`);

    const label = this.name || element.alt || 'Image Missing'; 
    element.src = `${this.url}${encodeURIComponent(label)}`;
  }
}
