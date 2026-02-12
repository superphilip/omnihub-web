import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { ColumnDef } from '@tanstack/angular-table';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Role, RolesApiResponse } from './interfaces/Roles';
import { mapApiColumnsToDefs, staticRoleColumns } from './utils/ColumsFromBackend';
import { formatRoleName } from '@core/utils/role.utils';
import { CustomHeaderTable } from 'src/app/shared/components/CustomHeaderTable/CustomHeaderTable';
import { TanTable } from 'src/app/shared/components/TanTable/TanTable';
import { ActionItem } from 'src/app/shared/components/CustomActionsMenu/CustomActionsMenu';
import { TranslateModule } from '@ngx-translate/core';
import { RolesParams, RolesService } from './services/Roles.service';
import { CustomModal } from 'src/app/shared/components/CustomModal/CustomModal';
import { ToastService } from '@core/services/Toast.service';
import { RoleForm } from './components/RoleForm/RoleForm';
import { I18nService } from '@core/services/I18.service';
import { normalizeBackendErrors } from '@core/utils/error.utils';
import { handleNormalizedErrors } from '@core/utils/formError.utils';
import { Router } from '@angular/router';
import { AuthTokenService } from '@core/services/AuthToken.service';

// === IMPORTA TUS UTILS ===


@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CustomHeaderTable,
    TanTable,
    TranslateModule,
    ReactiveFormsModule,
    CustomModal,
    RoleForm
  ],
  templateUrl: './Roles.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Roles {
  private readonly svc = inject(RolesService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly tokenService = inject(AuthTokenService);

  // === UI state ===
  readonly search = signal('');
  readonly pageSize = signal(10);
  readonly pageIndex = signal(0);
  readonly sorting = signal<Array<{ id: string; desc: boolean }>>([]);

  readonly rows = signal<readonly Role[]>([]);
  readonly columns = signal<readonly ColumnDef<Role, any>[]>(staticRoleColumns);
  readonly pageCount = signal(1);
  readonly totalCount = signal(0);
  readonly showForm = signal(false); // Visibilidad del modal
  readonly formPending = signal(false);
  readonly authReady = computed(() => this.tokenService.refreshTokenSubject.value !== null);

  // === Formulario para crear rol ===
  roleForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    isSystemRole: [false]
  });

  // === Buscador (debounce) ===
  private readonly search$ = toObservable(this.search).pipe(
    map(v => v?.trim() ?? ''),
    debounceTime(1000),
    distinctUntilChanged()
  );
  readonly debouncedSearch = toSignal(this.search$, { initialValue: '' });
  readonly backendSearch = computed(() => formatRoleName(this.debouncedSearch()));
  readonly lang = toSignal(this.i18n.current$);  // Siendo current$ un observable público

  // === Query reactivo para roles ===
  readonly query = injectQuery<RolesApiResponse, Error, RolesApiResponse, readonly unknown[]>(() => {
    const lang = this.lang();
    const params: RolesParams = {
      page: this.pageIndex() + 1,
      limit: this.pageSize(),
      search: this.backendSearch(),
      includeColumns: true,
      lang // <-- Incluyes lang si tu backend lo soporta, o solo en queryKey si no
    };
    return {

      queryKey: this.svc.rolesKey(params),
      queryFn: () => {

        return this.svc.fetchRoles(params)
      },
      keepPreviousData: true,
      staleTime: 30_000,
    };
  });

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
    { key: 'edit', label: 'Editar', icon: 'fa-solid fa-pen-to-square', colorClass: 'text-[#2B5797]' },
    { key: 'details', label: 'Detalles', icon: 'fa-solid fa-circle-info', colorClass: 'text-emerald-600' },
    { key: 'delete', label: 'Eliminar', icon: 'fa-solid fa-trash', colorClass: 'text-red-600' },
  ]);

  constructor() {
    effect(() => {
      const status = this.query.status();
      const response = this.query.data();
      if (status === 'error' || !response) return;

      this.rows.set(response.data);
      this.pageCount.set(response.meta.totalPages);
      this.totalCount.set(response.meta.total);

      if (Array.isArray(response.columns) && response.columns.length > 0) {
        this.columns.set(mapApiColumnsToDefs(response.columns));
      }

      // Prefetch de páginas (opcional)
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
    // Opcional: Para evitar overflow de página
    effect(() => {
      if (this.pageIndex() >= this.pageCount()) {
        this.pageIndex.set(0);
      }
    });
  }

  // === HANDLERS PARA TABLA Y BUSCADOR ===
  setPage(newPageZeroBased: number) { this.pageIndex.set(newPageZeroBased); }
  setPageSize(limit: number | string) {
    const parsed = typeof limit === 'string' ? parseInt(limit, 10) : limit;
    this.pageSize.set(parsed);
    this.pageIndex.set(0);
  }
  onSortingChange(next: Array<{ id: string; desc: boolean }>) { this.sorting.set(next); }
  onSearchChange(term: string) { this.search.set(term); }
  forceSearchNow() { /* injectQuery reconsulta al cambiar search() */ }

  onEdit(row: Role) { /* TODO: editar rol */ }
  onDetails(row: Role) { /* TODO: detalles del rol */ }
  onDelete(row: Role) { /* TODO: eliminar rol */ }

  // Nuevo: ahora aprovechas la utilidad en cualquier error de backend
  formatQueryError(err: unknown): string {
    const normalized = normalizeBackendErrors(err);
    const msg = (normalized['general'] && normalized['general'][0]) || 'Ocurrió un error inesperado en la consulta.';
    console.error('Error en consulta de roles:', err, 'Normalized:', msg);
    return msg;
  }

  // === CREACIÓN DE ROL (modal + role-form) usando utils ===
  onOpenForm() {
    this.showForm.set(true);
    this.formPending.set(false);
    this.roleForm.reset({
      name: '',
      description: '',
      isSystemRole: false
    });
  }

  onCancelForm() {
    this.showForm.set(false);
    this.formPending.set(false);
  }

  onSubmitRole(role: Role) {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      this.toast.show('Completa todos los campos requeridos', 'error');
      return;
    }
    this.formPending.set(true);

    this.svc.createRoleMutation.mutate(role, {
      onSuccess: () => {
        this.toast.show('¡Rol creado exitosamente!', 'success');
        this.showForm.set(false);
        this.formPending.set(false);
        this.svc.invalidateRoles();
      },
      onError: (err: unknown) => {
        this.formPending.set(false);
        // Aquí aplicas el flujo pro:
        const normalized = normalizeBackendErrors(err);
        handleNormalizedErrors(normalized, this.roleForm, (msg) => this.toast.show(msg, 'error'));

        const refreshError =
          normalized['general'] &&
          normalized['general'].some(msg =>
            typeof msg === 'string' &&
            msg.toLowerCase().includes('refresh token') && msg.toLowerCase().includes('inválido')
          );

        if (refreshError) {
          // Borra auth, session, etc
          localStorage.clear(); // o solo lo necesario
          this.toast.show('Tu sesión expiró. Por favor inicia sesión de nuevo.', 'error');
          this.router.navigate(['/login']);
          return;
        }

        handleNormalizedErrors(normalized, this.roleForm, (msg) => this.toast.show(msg, 'error'));
      }
    });
  }
}
