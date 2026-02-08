import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

function isTokenExpired(token: string): boolean {
  if (!token) return true;
  try {
    const pureToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const payload = pureToken.split('.')[1];
    if (!payload) return true;
    const decoded = JSON.parse(atob(payload));
    if (!decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

export const PublicGuard: CanActivateFn = () => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Evitamos errores de SSR
  if (!isPlatformBrowser(platformId)) return true;

  const token = localStorage.getItem('accessToken') ?? '';

  // Si el token existe, no lo dejes entrar al login, mándalo al panel
   if (token && !isTokenExpired(token)) {
    return router.createUrlTree(['/admin']);
  }

  // Si no hay token, permite que vea el login
  return true;
};
