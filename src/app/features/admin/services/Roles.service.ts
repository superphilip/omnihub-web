import { inject, Injectable } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { QueryClient } from '@tanstack/query-core';
import { lastValueFrom } from 'rxjs';
import { RolesApiResponse } from '../pages/Roles/interfaces/Roles';
import { SortingState } from '@tanstack/angular-table';

export type CreateRolePayload = {
  name: string;
  description?: string;
  isSystemRole: boolean;
};

export type RolesParams = {
  page?: number;          // 1-based
  limit?: number;
  search?: string;
  includeColumns?: boolean;   // pide columns al backend
  sorting?: SortingState;
  sort?: string;
  order?: 'asc' | 'desc';
};

@Injectable({ providedIn: 'root' })
export class RolesService {
  private api = inject(ApiService);
  private qc = inject(QueryClient);

  createRoleMutation = injectMutation(() => ({
    mutationFn: (payload: CreateRolePayload) => lastValueFrom(this.api.post('roles', payload)),
  }));

  fetchRoles$(params?: RolesParams) {
    const page = Number(params?.page ?? 1);
    const limit = Number(params?.limit ?? 25);
    const search = params?.search;
    const includeColumns = !!params?.includeColumns;

    const so = this.mapSortingToApi(params?.sorting);
    const sort = params?.sort ?? so.sort;
    const order: 'asc' | 'desc' = (params?.order ?? so.order ?? 'asc') as 'asc' | 'desc';

    const query: Record<string, string | number> = { page, limit, order };
    if (search) query['search'] = search;
    if (sort) query['sort'] = sort;
    if (includeColumns) query['include'] = 'columns';

    return this.api.get<RolesApiResponse>('roles', query);
  }

  fetchRoles(params?: RolesParams) {
    return lastValueFrom(this.fetchRoles$(params));
  }

  rolesKey(params: RolesParams) {
    const page = Number(params.page ?? 1);
    const limit = Number(params.limit ?? 25);
    const search = params['search'] ?? '';
    const includeColumns = !!params['includeColumns'];
    const so = this.mapSortingToApi(params.sorting);
    const sort = params['sort'] ?? so.sort ?? '';
    const order = params['order'] ?? so.order ?? 'asc';
    return ['roles', page, limit, search, sort, order, includeColumns] as const;
  }

  prefetchRoles(params: RolesParams) {
    return this.qc.prefetchQuery({
      queryKey: this.rolesKey(params),
      queryFn: () => this.fetchRoles(params),
      staleTime: 30_000,
    });
  }

  private mapSortingToApi(sorting?: SortingState): { sort?: string; order?: 'asc' | 'desc' } {
    if (!sorting || sorting.length === 0) return {};
    const first = sorting[0];
    return { sort: first.id, order: first.desc ? 'desc' : 'asc' };
  }
}
