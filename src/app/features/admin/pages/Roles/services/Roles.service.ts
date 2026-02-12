import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { ApiService } from '@core/services/api.service';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { injectMutation } from '@tanstack/angular-query-experimental';
import { lastValueFrom, Subscription, Observable } from 'rxjs';
import { I18nService } from '@core/services/I18.service';
import type { SortingState } from '@tanstack/table-core';
import { cleanParams } from '@core/utils/clean-params.utils';
import type { RolesApiResponse } from '../interfaces/Roles';

export type RolesParams = {
  page?: number | string;
  limit?: number | string;
  search?: string;
  sorting?: SortingState;
  sort?: string;
  order?: 'asc' | 'desc';
  includeColumns?: boolean;
  lang?: string;
};

@Injectable({ providedIn: 'root' })
export class RolesService implements OnDestroy {
  private api = inject(ApiService);
  private qc = inject(QueryClient);
  private i18n = inject(I18nService);
  private sub: Subscription;


  constructor() {
    this.sub = this.i18n.valueChanges().subscribe(() => {
      this.invalidateRoles();
    });
  }
  ngOnDestroy() { this.sub?.unsubscribe(); }

  createRoleMutation = injectMutation(() => ({
    mutationFn: (payload: any) => lastValueFrom(this.api.post('roles', payload)),
  }));

  rolesKey(params: RolesParams) {
    const lang = this.i18n.current ?? 'es';
    const page = Number(params.page ?? 1);
    const limit = Number(params.limit ?? 25);
    const search = params['search'] ?? '';
    const includeColumns = !!params['includeColumns'];
    const so = this.mapSortingToApi(params.sorting);
    const sort = params['sort'] ?? so.sort ?? '';
    const order = params['order'] ?? so.order ?? 'asc';
    return [
      'roles',
      lang, // <-- Aquí añades el idioma
      page,
      limit,
      search,
      sort,
      order,
      includeColumns,
    ] as const;
  }

  fetchRoles$(params?: RolesParams): Observable<RolesApiResponse> {
    const p = params ?? {};
    const so = this.mapSortingToApi(p.sorting);

    const queryObj = cleanParams({
      page: p.page ?? 1,
      limit: p.limit ?? 25,
      search: p.search ?? '',
      sort: p.sort ?? so.sort ?? '',
      order: p.order ?? so.order ?? 'asc',
      include: p.includeColumns ? 'columns' : undefined,
    });

    // Aquí agrega el header Accept-Language
    return this.api.get<RolesApiResponse>('roles', queryObj);
  }

  fetchRoles(params?: RolesParams): Promise<RolesApiResponse> {
    return lastValueFrom(this.fetchRoles$(params));
  }

  prefetchRoles(params: RolesParams) {
    return this.qc.prefetchQuery({
      queryKey: this.rolesKey(params),
      queryFn: () => this.fetchRoles(params),
      staleTime: 30_000,
    });
  }

  /** Método público para invalidar queries de roles tras cambios */
  invalidateRoles() {
    this.qc.invalidateQueries({ queryKey: ['roles'] });
  }

  private mapSortingToApi(sorting?: SortingState): { sort?: string; order?: 'asc' | 'desc' } {
    if (!sorting || sorting.length === 0) return {};
    const first = sorting[0];
    return { sort: first.id, order: first.desc ? 'desc' : 'asc' };
  }
}
