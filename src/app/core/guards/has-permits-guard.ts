import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../services/auth-service';

export const hasPermitsGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.user();
  const userPermits = authService.permits();
  const hasAdminPermit = userPermits.some((p) => p.includes('ADMIN'));

  if (!user) {
    return router.parseUrl('/');
  }

  if (!hasAdminPermit) {
    return router.parseUrl('/');
  }

  return true;
};
