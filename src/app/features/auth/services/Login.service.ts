import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';
import { LoginRequest, LoginResponse } from '../interfaces/Login';
import { AuthTokenService } from '@core/services/AuthToken.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private api = inject(ApiService);
  private tokenService = inject(AuthTokenService);

  loginMutation = injectMutation(() => ({
    mutationFn: (payload: LoginRequest) => {
      console.log('Enviando al servidor...', payload);
      return firstValueFrom(
        this.api.post<LoginResponse>('auth/login', payload)
      );
    },
    onSuccess: (res) => {
      if (res?.accessToken && res?.refreshToken) {
        this.tokenService.setToken(res.accessToken);
        this.tokenService.setRefreshToken(res.refreshToken);
      }
      console.log('Servidor respondió OK:', res);
    },
    onError: (err) => {
      if (err && typeof err === 'object' && 'error' in err) {
        console.error('Detalles del error en mutate:', (err as any).error);
      } else {
        console.error('Error desconocido en mutate:', err);
      }
    }
  }));

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}
