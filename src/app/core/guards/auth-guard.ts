import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../../services/auth-service';
import Swal from 'sweetalert2';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLogged()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const requiredPermissions = route.data['permissions'] as string[];
  if (requiredPermissions && requiredPermissions.length > 0) {
    if (!authService.hasAnyPermission(requiredPermissions)) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No tienes permiso para acceder a este contenido',
      });
      router.navigate(['']);
      return false;
    }
  }

  return true;
};