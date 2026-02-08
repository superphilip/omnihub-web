import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, switchMap, filter, take, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  // para evitar múltiples refresh simultáneos
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private http = inject(HttpClient);
  private router = inject(Router);

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const accessToken = this.getToken();

    // ¿Expiró el accessToken? (chequeamos antes de pedir)
    if (accessToken && this.isTokenExpired(accessToken)) {
      return this.tryRefreshTokenAndRetry(req, next);
    }

    // agrega el header si hay token válido
    const authReq = accessToken ? req.clone({
      setHeaders: { Authorization: accessToken }
    }) : req;

    return next.handle(authReq).pipe(
      catchError((error: unknown) => {
        // Si es un 401, intenta refresh
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.tryRefreshTokenAndRetry(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  private tryRefreshTokenAndRetry(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        this.logout();
        return throwError(() => new Error('Sin refresh token. Login de nuevo.'));
      }

      return this.refreshAccessToken(refreshToken).pipe(
        switchMap((newAccessToken: string) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(newAccessToken);
          this.setToken(newAccessToken);
          // retry con nuevo token
          const retryReq = req.clone({ setHeaders: { Authorization: newAccessToken } });
          return next.handle(retryReq);
        }),
        catchError(() => {
          this.isRefreshing = false;
          this.logout();
          return throwError(() => new Error('El refresh token es inválido o expiró. Login nuevamente.'));
        })
      );
    } else {
      // Si ya se está refrescando: espera el nuevo access token
      return this.refreshTokenSubject.pipe(
        filter((token: string | null) => !!token),
        take(1),
        switchMap((newAccessToken: string | null) => {
          if (!newAccessToken) {
            this.logout();
            return throwError(() => new Error('El refresh token es inválido o expiró. Login nuevamente.'));
          }
          const retryReq = req.clone({ setHeaders: { Authorization: newAccessToken } });
          return next.handle(retryReq);
        })
      );
    }
  }

  private refreshAccessToken(refreshToken: string): Observable<string> {
    // Llama a tu endpoint backend
    return this.http.post<{ accessToken: string; refreshToken: string }>(
      '/api/auth/refresh',
      { refreshToken },
      { headers: { Authorization: refreshToken } }
    ).pipe(
      tap(tokens => {
        this.setToken(tokens.accessToken);
        this.setRefreshToken(tokens.refreshToken);
      }),
      switchMap(tokens => of(tokens.accessToken))
    );
  }

  // --- Helpers para localStorage y JWT ---

  private getToken(): string | null {
    return localStorage.getItem('token'); // accede con 'Bearer ...'
  }
  private setToken(token: string) {
    localStorage.setItem('token', token);
  }
  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
  private setRefreshToken(token: string) {
    localStorage.setItem('refreshToken', token);
  }

  private logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    this.router.navigate(['/login']);
  }

  // Decodificamos JWT para ver cuándo expira (no requiere secreto)
  private isTokenExpired(token: string): boolean {
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
}
