import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { map, catchError, of } from 'rxjs';

type SetupStatusResponse = { success: boolean; data: { needsSetup: boolean } };

export const SetupGuard: CanActivateFn = (route, state) => {
  const api = inject(ApiService);
  const router = inject(Router);

  return api.get<SetupStatusResponse>('setup/status').pipe(
    map(res => {
      // Permite navegar a /setup solo si needsSetup: true
      if (res.data?.needsSetup) return true;
      // Si ya no necesita setup, redirige (según lógica, aquí a /auth/login)
      return router.createUrlTree(['/auth/login']);
    }),
    catchError(() => of(router.createUrlTree(['/auth/login'])))
  );
};
