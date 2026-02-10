import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { injectQuery, injectMutation } from '@tanstack/angular-query-experimental';
import { RolesApiResponse } from '../interfaces/Roles';
import { firstValueFrom, lastValueFrom, tap } from 'rxjs';

export type CreateRolePayload = {
  name: string;
  description?: string;
  isSystemRole: boolean;
};

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private api = inject(ApiService);

  // Mutación al estilo LoginService (usando this.api)
  createRoleMutation = injectMutation(() => ({
    mutationFn: (payload: CreateRolePayload) => {
      console.log('POST /roles ->', payload);
      return lastValueFrom(this.api.post('roles', payload));
    },
    onSuccess: (res) => {
      console.log('Rol creado OK:', res);
    },
    onError: (err) => {
      if (err && typeof err === 'object' && 'error' in err) {
        console.error('Error en createRole:', (err as any).error);
      } else {
        console.error('Error en createRole:', err);
      }
    }
  }));

  // Opcional: método simple (por si alguna vez quieres llamar sin mutation)
  createRole(payload: CreateRolePayload) {
    return lastValueFrom(this.api.post('roles', payload));
  }

  getRolesQuery(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) {
    return injectQuery(() => ({
      queryKey: ['roles', params],
      queryFn: () =>
        firstValueFrom(
          this.api.get<RolesApiResponse>(
            'roles',
            params
              ? Object.fromEntries(
                  Object.entries(params).filter(([_, v]) => v != null)
                )
              : undefined
          ).pipe(
            tap(res => console.log('Respuesta de /roles:', res))
          )
        ),
    }));
  }
}
