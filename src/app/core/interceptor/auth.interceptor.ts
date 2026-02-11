import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthTokenService } from '@core/services/AuthToken.service';
import { ApiService } from '@core/services/api.service';
import { catchError, filter, switchMap, take, throwError, tap } from 'rxjs';

function isAuthUrl(url: string): boolean {
  const u = url.toLowerCase();
  return u.includes('/auth/login') || u.includes('/auth/refresh') || u.includes('/auth/signup');
}

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(AuthTokenService);
  const api = inject(ApiService);

  // Excluir rutas de auth del flujo de autorización/refresh
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
      if (error instanceof HttpErrorResponse && error.status === 401 && !isAuthUrl(req.url)) {
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
      return throwError(() => new Error('Refresh token inválido o vencido'));
    }

    // Usa ApiService → environment.apiUrl ya incluye /api
    return api.post<{ accessToken: string; refreshToken: string }>('auth/refresh', { refreshToken }).pipe(
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
    return tokenService.refreshTokenSubject.pipe(
      filter(token => !!token),
      take(1),
      switchMap(token => next(req.clone({ setHeaders: { Authorization: token! } })))
    );
  }
}
