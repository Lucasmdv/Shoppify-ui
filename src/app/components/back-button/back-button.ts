import { Component, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';

@Component({
    selector: 'app-back-button',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './back-button.html',
    styleUrl: './back-button.css'
})
export class BackButtonComponent {
    private location = inject(Location);

    goBack() {
        this.location.back();
    }
}
