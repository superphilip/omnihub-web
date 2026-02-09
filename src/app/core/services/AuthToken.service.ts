// auth-token.service.ts
import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID); // Inyectamos el ID de plataforma

  public isRefreshing = false;
  public refreshTokenSubject = new BehaviorSubject<string | null>(null);

  // Helper para saber si estamos en el navegador
  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  setToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('accessToken', token);
    }
  }

  getRefreshToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }

  setRefreshToken(token: string): void {
    if (this.isBrowser) {
      localStorage.setItem('refreshToken', token);
    }
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      this.router.navigate(['/login']);
    }
  }

  isTokenExpired(token: string): boolean {
    try {
      const pureToken = token.startsWith('Bearer ') ? token.slice(7) : token;
      const payload = pureToken.split('.')[1];
      if (!payload) return true;
      const decoded = JSON.parse(atob(payload));
      if (!decoded.exp) return true;
      return Date.now() >= decoded.exp * 1000;
    } catch (e) {
      return true;
    }
  }
}
