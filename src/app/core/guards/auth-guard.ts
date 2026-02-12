import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

function isTokenExpired(token: string): boolean {
  try {
    const pureToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const payload = JSON.parse(atob(pureToken.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return true;
  }

  // 1. Obtener el token de almacenamiento (localStorage)
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');

  // 2. Validar que exista y no esté vencido
  if (!accessToken || isTokenExpired(accessToken)) {
    // 3. Opción: guardar a dónde quería ir el usuario, si deseas
    localStorage.setItem('redirect', state.url);

    // 4. Redirigir a login (o la ruta pública que quieras)
    return router.createUrlTree(['/auth/login']);
  }

  // 5. Token válido: se permite la navegación
  return true;
};
