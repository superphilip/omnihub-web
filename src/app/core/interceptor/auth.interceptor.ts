import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthTokenService } from '@core/services/AuthToken.service';
import { ToastService } from '@core/services/Toast.service';
import { ApiService } from '@core/services/api.service';
import { catchError, filter, switchMap, take, throwError, tap } from 'rxjs';

function isAuthUrl(url: string): boolean {
  const u = url.toLowerCase();
  return u.includes('/auth/login') || u.includes('/auth/refresh') || u.includes('/auth/signup');
}

/**
 * Interceptor PRO con logs para depurar refresh token
 */
export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(AuthTokenService);
  const toast = inject(ToastService);
  const api = inject(ApiService);

  // Excluir rutas de auth del flujo de autorización/refresh
  if (isAuthUrl(req.url)) {
    return next(req);
  }

  const accessToken = tokenService.getToken();

  // Intentar refresh solo si el access token está vencido
  if (accessToken && tokenService.isTokenExpired(accessToken)) {
    return handleRefresh(req, next, tokenService, api, toast);
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
        return handleRefresh(authReq, next, tokenService, api, toast);
      }
      return throwError(() => error);
    })
  );
};

function handleRefresh(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  tokenService: AuthTokenService,
  api: ApiService,
  toast: ToastService
) {
  if (!tokenService.isRefreshing) {
    tokenService.isRefreshing = true;
    tokenService.refreshTokenSubject.next(null);

    const refreshToken = tokenService.getRefreshToken();
    // Debug log: muestra el refreshToken actual usado
    console.log('Enviando refreshToken:', refreshToken);

    if (!refreshToken || tokenService.isTokenExpired(refreshToken)) {
      tokenService.isRefreshing = false;
      toast.show('Tu sesión ha expirado. Debes iniciar nuevamente.', 'error');
      tokenService.logout();
      return throwError(() => new Error('Refresh token inválido o vencido'));
    }

    return api.post<{ accessToken: string; refreshToken: string }>('auth/refresh', { refreshToken }).pipe(
      tap(tokens => {
        tokenService.isRefreshing = false;
        tokenService.setToken(tokens.accessToken);
        tokenService.setRefreshToken(tokens.refreshToken);
        tokenService.refreshTokenSubject.next(tokens.accessToken);

        // Log para confirmar rotación
        console.log('Nuevo accessToken:', tokens.accessToken);
        console.log('Nuevo refreshToken (guardado):', tokens.refreshToken);
      }),
      switchMap(tokens => next(req.clone({ setHeaders: { Authorization: tokens.accessToken } }))),
      catchError(err => {
        tokenService.isRefreshing = false;
        toast.show('Tu sesión ha expirado. Debes iniciar nuevamente.', 'error');
        tokenService.logout();
        // Log para depurar errores de refresh
        console.log('Error en refresh:', err);
        return throwError(() => err);
      })
    );
  } else {
    // Espera a que se actualice el token, en caso de refresh concurrente
    return tokenService.refreshTokenSubject.pipe(
      filter(token => !!token),
      take(1),
      switchMap(token =>
        next(req.clone({ setHeaders: { Authorization: token! } }))
      )
    );
  }
}
