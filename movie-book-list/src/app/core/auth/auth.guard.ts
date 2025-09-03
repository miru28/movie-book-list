import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export function authRequiredGuard() {
  const auth = inject(AuthService),
    router = inject(Router);
  return auth.isLoggedIn() || router.createUrlTree(['/auth/login']);
}

export function canActivateAuth() {
  const auth = inject(AuthService),
    router = inject(Router);
  return !auth.isLoggedIn() || router.createUrlTree(['/library']);
}
