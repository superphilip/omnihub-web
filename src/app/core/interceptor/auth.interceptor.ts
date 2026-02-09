// auth.interceptor.ts
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthTokenService } from '@core/services/AuthToken.service';

import { catchError, filter, switchMap, take, throwError, tap } from 'rxjs';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(AuthTokenService);
  const http = inject(HttpClient);

  const accessToken = tokenService.getToken();

  // 1. Verificación previa al envío
  if (accessToken && tokenService.isTokenExpired(accessToken)) {
    return handleRefresh(req, next, tokenService, http);
  }

  // 2. Clonar petición con token si existe
  const authReq = accessToken
    ? req.clone({ setHeaders: { Authorization: accessToken } })
    : req;

  // 3. Manejo de respuesta y errores (401)
  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handleRefresh(authReq, next, tokenService, http);
      }
      return throwError(() => error);
    })
  );
};

/**
 * Función auxiliar para gestionar la renovación del token
 */
function handleRefresh(req: HttpRequest<unknown>, next: HttpHandlerFn, tokenService: AuthTokenService, http: HttpClient) {
  if (!tokenService.isRefreshing) {
    tokenService.isRefreshing = true;
    tokenService.refreshTokenSubject.next(null);

    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) {
      tokenService.logout();
      return throwError(() => new Error('Sin refresh token disponible'));
    }

    return http.post<{ accessToken: string; refreshToken: string }>('/api/auth/refresh', { refreshToken }).pipe(
      tap(tokens => {
        tokenService.isRefreshing = false;
        tokenService.setToken(tokens.accessToken);
        tokenService.setRefreshToken(tokens.refreshToken);
        tokenService.refreshTokenSubject.next(tokens.accessToken);
      }),
      switchMap(tokens => next(req.clone({ setHeaders: { Authorization: tokens.accessToken } }))),
      catchError(err => {
        tokenService.isRefreshing = false;
        tokenService.logout();
        return throwError(() => err);
      })
    );
  } else {
    // Si ya se está refrescando, esperamos al nuevo token
    return tokenService.refreshTokenSubject.pipe(
      filter(token => !!token),
      take(1),
      switchMap(token => next(req.clone({ setHeaders: { Authorization: token! } })))
    );
  }
}
