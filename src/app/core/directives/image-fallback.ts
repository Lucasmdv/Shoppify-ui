import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
 //img adelante para especificar a que etiqueta se aplica la directiva
 //not para decirle que se aplique a todas a menos que se ponga [no-errorHandler]

 selector: 'img:not([disable-errorHandler])',
  standalone: true, 
})
export class ImageFallbackDirective {

  readonly url = "https://placehold.co/600x400?text="; //Pagina generador de placeholder.
  @Input() name!: string

  constructor(private el: ElementRef<HTMLImageElement>) {}


  @HostListener('error')
  loadFallbackOnError() {
    const element = this.el.nativeElement;
    console.warn(`Image not found: ${element.src}. Using placeholder.`);

    const label = this.name || element.alt || 'Image Missing'; //Usamos this.name si se especifica o el alt que se pone en img o Image missing.
    element.src = `${this.url}${encodeURIComponent(label)}`;
  }
}
