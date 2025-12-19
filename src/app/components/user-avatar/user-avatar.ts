import { Component, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import Swal from 'sweetalert2';
import { DropdownComponent, DropdownMenuDirective, DropdownToggleDirective, DropdownItemDirective } from '@coreui/angular';
import { CommonModule } from '@angular/common';
import { ImageFallbackDirective } from '../../core/directives/image-fallback';

@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [RouterLink, DropdownComponent, DropdownMenuDirective, DropdownToggleDirective, DropdownItemDirective, CommonModule, ImageFallbackDirective],
  
  templateUrl: './user-avatar.html',
  styleUrl: './user-avatar.css'
})
export class UserAvatar {
  showMenu = false;


  constructor(private router: Router , public auth:AuthService) {}

  get truncatedFirstName(): string {
    const firstName = this.auth.user()?.firstName ?? '';
    return firstName.length > 6 ? `${firstName.slice(0, 6)}..` : firstName;
  }

  toggleMenu() {
    if (!this.auth.user()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.showMenu = !this.showMenu;
  }

  hideMenu() {
    this.showMenu = false;
  }

  logout() {
    Swal.fire({
      title: '¿Cerrar sesión?',
      text: 'Tu sesión actual se cerrará',
      icon: 'warning',
      iconColor: '#6141e8',
      showCancelButton: true,
      background: "#f7f7f8",
      color: "black",
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.auth.logout();
        localStorage.clear();
        sessionStorage.clear();
        Swal.fire({
          title: 'Sesión cerrada',
          text: 'Has salido correctamente de tu cuenta.',
          icon: 'success',
          background: "#f7f7f8",
          color: "black",
          confirmButtonText: 'Aceptar'
        }).then(() => {
          window.location.href = '/auth/login';
        });
      }
    });
  }
}

