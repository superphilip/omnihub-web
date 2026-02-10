import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { RolesApiResponse } from '../interfaces/Roles';
import { lastValueFrom } from 'rxjs';

export type CreateRolePayload = {
  name: string;
  description?: string;
  isSystemRole: boolean;
};

@Injectable({ providedIn: 'root' })
export class RolesService {
  private api = inject(ApiService);

  createRoleMutation = injectMutation(() => ({
    mutationFn: (payload: CreateRolePayload) => lastValueFrom(this.api.post('roles', payload)),
  }));

  fetchRoles(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) {
    const filtered = params
      ? Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null))
      : undefined;
    return this.api.get<RolesApiResponse>('roles', filtered);
  }
}
