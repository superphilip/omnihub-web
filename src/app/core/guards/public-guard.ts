import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

export const PublicGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Evitamos errores de SSR
  if (!isPlatformBrowser(platformId)) return true;

  const token = localStorage.getItem('token');

  // Si el token existe, no lo dejes entrar al login, mándalo al panel
  if (token) {

    return router.createUrlTree(['/admin']);
  }

  // Si no hay token, permite que vea el login
  return true;
};
