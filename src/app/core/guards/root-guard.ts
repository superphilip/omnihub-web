import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { map, catchError, of } from 'rxjs';

type SetupStatusResponse = { success: boolean; data: { needsSetup: boolean } };

function isTokenExpired(token: string): boolean {
  if (!token) return true;
  try {
    const pureToken = token.startsWith('Bearer ') ? token.slice(7) : token;
    const payload = JSON.parse(atob(pureToken.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export const RootGuard: CanActivateFn = (route, state) => {
  const api = inject(ApiService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  // Solo acceder a localStorage si estamos en browser (no en SSR)
  let token = '';
  let loggedIn = false;

  if (isPlatformBrowser(platformId)) {
    token = localStorage.getItem('token') ?? '';
    loggedIn = !!token && !isTokenExpired(token);
  }

  // Consulta el estado de setup
  return api.get<SetupStatusResponse>('setup/status').pipe(
    map(res => {
      const needsSetup = res.data?.needsSetup;
      console.log('[ROOT GUARD]', { needsSetup, loggedIn });

      if (needsSetup) {
        return router.createUrlTree(['/setup']);
      }
      if (loggedIn) {
        return router.createUrlTree(['/admin']);
      }
      return router.createUrlTree(['/auth/login']);
    }),
    catchError(() => of(router.createUrlTree(['/auth/login'])))
  );
};
