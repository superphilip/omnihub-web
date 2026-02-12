import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { map, catchError, of, timeout } from 'rxjs';

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

  let accessToken = '';
  let refreshToken = '';
  let loggedIn = false;

  if (isPlatformBrowser(platformId)) {
  accessToken = localStorage.getItem('accessToken') ?? '';
  refreshToken = localStorage.getItem('refreshToken') ?? '';
  if (accessToken && refreshToken) {
    loggedIn = !isTokenExpired(accessToken) && !isTokenExpired(refreshToken);
    try {
      const pureToken = accessToken.startsWith('Bearer ') ? accessToken.slice(7) : accessToken;
      const payload = JSON.parse(atob(pureToken.split('.')[1]));
      console.log('PAYLOAD JWT:', payload);
      console.log('LOGGEDIN?', loggedIn);
    } catch {
      console.log('JWT mal formado');
    }
  }
}

  return api.get<SetupStatusResponse>('setup/status').pipe(
    timeout({ each: 5000 }),
    map(res => {
      const needsSetup = res.data?.needsSetup;
      console.log('[ROOT GUARD]', { needsSetup, loggedIn });

      if (needsSetup) {
        return router.createUrlTree(['/setup']);
      }
      if (loggedIn) {
        return true; // Permite acceder a /admin
      }
      return router.createUrlTree(['/auth/login']); // Usuario sin sesión va a login
    }),
    catchError(err => {
      console.error('[ROOT GUARD ERROR]', err);
      return of(router.createUrlTree(['/auth/login']));
    })
  );
};
