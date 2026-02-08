import { inject } from '@angular/core';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { SetupInitializePayload, SetupInitializeResponse } from '../interfaces/setup-initialize';
import { ApiService } from '@core/services/api.service';


export function useSetupInitializeMutation() {
  const api = inject(ApiService);

  return injectMutation(() => ({
    mutationFn: (payload: SetupInitializePayload) => {
      console.log('Enviando al servidor...', payload);
      return lastValueFrom(
        api.post<SetupInitializeResponse>('setup/initialize', payload)
      );
    },
    onSuccess: (res) => {
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
}
