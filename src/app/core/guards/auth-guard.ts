import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import Swal from 'sweetalert2';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (!authService.isTokenValid()) {
    console.log('Token inválido o expirado');
    router.navigate(['/auth/login']);
    return false;
  }

  const requiredPermissions = route.data['permissions'] as string[];
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (!authService.hasAnyPermission(requiredPermissions)) {
      router.navigate(['']);
      Swal.fire({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        icon: 'error',
        title: 'No tienes permiso para acceder a este contenido'
      });
      return false;
    }
  }

  return true;
};