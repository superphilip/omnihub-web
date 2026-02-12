import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthTokenService } from '@core/services/AuthToken.service';
import { ApiService } from '@core/services/api.service';
import { catchError, filter, switchMap, take, throwError, tap } from 'rxjs';

function isAuthUrl(url: string): boolean {
  const u = url.toLowerCase();
  return u.includes('/auth/login') || u.includes('/auth/refresh');
}

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(AuthTokenService);
  const api = inject(ApiService);

  if (isAuthUrl(req.url)) {
    return next(req);
  }

  const accessToken = tokenService.getToken();

  // Intentar refresh solo si el access token está vencido
  if (accessToken && tokenService.isTokenExpired(accessToken)) {
    return handleRefresh(req, next, tokenService, api);
  }

  const authReq = accessToken
    ? req.clone({ setHeaders: { Authorization: accessToken } })
    : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !isAuthUrl(req.url)
      ) {
        return handleRefresh(authReq, next, tokenService, api);
      }
      return throwError(() => error);
    })
  );
};

function handleRefresh(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  tokenService: AuthTokenService,
  api: ApiService
) {
  if (!tokenService.isRefreshing) {
    tokenService.isRefreshing = true;
    tokenService.refreshTokenSubject.next(null);

    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken || tokenService.isTokenExpired(refreshToken)) {
      tokenService.isRefreshing = false;
      tokenService.logout();
      tokenService.refreshTokenSubject.next('error'); // Notifica error a los listeners (UI)
      return throwError(() => new Error('Refresh token inválido o vencido'));
    }

    // Primer request: inicia refresh, los demás esperan la signal
    return api.post<{ accessToken: string; refreshToken: string }>(
      'auth/refresh',
      { refreshToken }
    ).pipe(
      tap(tokens => {
        tokenService.isRefreshing = false;
        tokenService.setToken(tokens.accessToken);
        tokenService.setRefreshToken(tokens.refreshToken);
        tokenService.refreshTokenSubject.next(tokens.accessToken); // Libera la cola
        console.log('[AUTH] Refresh OK, nuevos tokens guardados');
      }),
      switchMap(tokens =>
        next(req.clone({ setHeaders: { Authorization: tokens.accessToken } }))
      ),
      catchError(err => {
        console.error('[AUTH] Refresh FALLÓ', err);
        tokenService.isRefreshing = false;
        tokenService.logout();
        tokenService.refreshTokenSubject.next('error'); // Notifica error a los listeners
        return throwError(() => err);
      })
    );
  } else {
    // Cualquier otra request debe esperar a que se complete el refresh
    return tokenService.refreshTokenSubject.pipe(
      filter(token => !!token && token !== 'error'),
      take(1),
      switchMap(token =>
        next(req.clone({ setHeaders: { Authorization: token! } }))
      )
    );
  }
}
