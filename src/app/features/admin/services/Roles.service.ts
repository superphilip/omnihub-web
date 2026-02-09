import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { RolesApiResponse } from '../interfaces/Roles';
import { firstValueFrom, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private api = inject(ApiService);
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
