import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImageFallbackDirective } from '../../core/directives/image-fallback';

@Component({
  selector: 'app-header-auth',
  imports: [RouterLink, ImageFallbackDirective],
  templateUrl: './header-auth.html',
  styleUrl: './header-auth.css'
})
export class HeaderAuth {

}
