import { Injectable, signal } from '@angular/core';
import { fromEvent } from 'rxjs';
import { debounceTime, map, startWith } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScreenSizeService {
  isScreenSmall = signal<boolean>(this.isSmallScreen())

  constructor() {
    console.log('ScreenSizeService ', this.isSmallScreen())
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(100),
        map(() => this.isSmallScreen()),
        startWith(this.isSmallScreen())
      )
      .subscribe(isSmall => {
        console.log('ScreenSizeService resize, new isSmallScreen:', isSmall)
        this.isScreenSmall.set(isSmall)
      })
  }

  private isSmallScreen(): boolean {
    return window.innerWidth < 1400
  }
}
