import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ColumnDef } from '@tanstack/angular-table';
// Imports necesarios
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';


import { RolesService, RolesParams } from '../../services/Roles.service';
import { Role } from './interfaces/Roles';
import { mapApiColumnsToDefs, staticRoleColumns } from './utils/ColumsFromBackend';
import { formatRoleName } from '@core/utils/role.utils';
import { CustomHeaderTable } from 'src/app/shared/components/CustomHeaderTable/CustomHeaderTable';
import { TanTable } from 'src/app/shared/components/TanTable/TanTable';
import { ActionItem } from 'src/app/shared/components/CustomActionsMenu/CustomActionsMenu';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CustomHeaderTable, TanTable, TranslateModule],
  templateUrl: './Roles.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Roles {
  private readonly svc = inject(RolesService);

  // UI state
  readonly search = signal('');
  readonly pageSize = signal(10);
  readonly pageIndex = signal(0);

  readonly sorting = signal<Array<{ id: string; desc: boolean }>>([]);

  // Data
  readonly rows = signal<readonly Role[]>([]);
  readonly columns = signal<readonly ColumnDef<Role, any>[]>(staticRoleColumns);
  readonly pageCount = signal(1);
  readonly totalCount = signal(0);

  private readonly search$ = toObservable(this.search).pipe(
  map(v => v?.trim() ?? ''),
  debounceTime(1000),
  distinctUntilChanged()
);
readonly debouncedSearch = toSignal(this.search$, { initialValue: '' });
readonly backendSearch = computed(() => formatRoleName(this.debouncedSearch()));

  // Meta para mostrar rango
  readonly meta = computed(() => this.query.data()?.meta ?? null);
  readonly rangeStart = computed(() => {
    const m = this.meta();
    if (!m) return 0;
    const hasRows = (this.rows().length ?? 0) > 0;
    return (m.page - 1) * m.limit + (hasRows ? 1 : 0);
  });
  readonly rangeEnd = computed(() => {
    const m = this.meta();
    if (!m) return 0;
    return Math.min(m.page * m.limit, m.total);
  });

  readonly rowMenuItems = (row: Role): readonly ActionItem[] => ([
    { key: 'edit',    label: 'Editar',   icon: 'fa-solid fa-pen-to-square', colorClass: 'text-[#2B5797]' },
    { key: 'details', label: 'Detalles', icon: 'fa-solid fa-circle-info',   colorClass: 'text-emerald-600' },
    { key: 'delete',  label: 'Eliminar', icon: 'fa-solid fa-trash',         colorClass: 'text-red-600' },
  ]);

  // Query reactivo: pide include=columns para columnas dinámicas
  readonly query = injectQuery(() => {
    const params: RolesParams = {
      page: this.pageIndex() + 1,
      limit: this.pageSize(),
      search: this.backendSearch(), // ← search con debounce
      includeColumns: true, // ← columnas dinámicas
      // sorting: this.sorting(),
    };
    return {
      queryKey: this.svc.rolesKey(params),
      queryFn: () => this.svc.fetchRoles(params),
      keepPreviousData: true,
      staleTime: 30_000,
    };
  });

  constructor() {
    // Procesa respuesta y prefetch
    effect(() => {
      const status = this.query.status();
      const response = this.query.data();
      if (status === 'error' || !response) return;

      // Filas y meta
      this.rows.set(response.data);
      this.pageCount.set(response.meta.totalPages);
      this.totalCount.set(response.meta.total);

      // Columnas: si el backend envió 'columns', mapea a ColumnDef; si no, deja las estáticas
      if (Array.isArray(response.columns) && response.columns.length > 0) {
        this.columns.set(mapApiColumnsToDefs(response.columns));
      } // else: columnas estáticas ya estaban set

      // Prefetch next/prev
      const nextPage = response.meta.page + 1;
      const prevPage = response.meta.page - 1;
      const params: RolesParams = {
        page: response.meta.page,
        limit: response.meta.limit,
        search: this.backendSearch(),
        includeColumns: true,
      };
      if (nextPage <= response.meta.totalPages) this.svc.prefetchRoles({ ...params, page: nextPage });
      if (prevPage >= 1) this.svc.prefetchRoles({ ...params, page: prevPage });
    });
  }

  // Handlers
  setPage(newPageZeroBased: number) { this.pageIndex.set(newPageZeroBased); }
  setPageSize(limit: number | string) {
    const parsed = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    this.pageSize.set(parsed);
    this.pageIndex.set(0);
  }

  onSortingChange(next: Array<{ id: string; desc: boolean }>) { this.sorting.set(next); }
  onSearchChange(term: string) { this.search.set(term); }
  forceSearchNow() { /* injectQuery reconsulta al cambiar search() */ }

  onEdit(row: Role) { /* TODO */ }
  onDetails(row: Role) { /* TODO */ }
  onDelete(row: Role) { /* TODO */ }

  formatQueryError(err: unknown): string {
    if (!err) return '';
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    const anyErr = err as any;
    return String(anyErr?.message ?? anyErr?.error?.message ?? anyErr ?? '');
  }
}
