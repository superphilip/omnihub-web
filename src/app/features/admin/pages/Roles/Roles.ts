import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RolesService } from '../../services/Roles.service';
import { injectQuery } from '@tanstack/angular-query-experimental';
import { Role, RolesApiResponse } from '../../interfaces/Roles';
import { CustomTable, CustomTableColumn } from "@components/CustomTable/CustomTable";
import { CustomLoading } from "@components/CustomLoading/CustomLoading";
import { CustomHeaderTable } from '@components/CustomHeaderTable/CustomHeaderTable';
import { CustomModal } from '@components/CustomModal/CustomModal';
import { RoleForm } from '../../components/RoleForm/RoleForm';
import { required } from 'src/app/utils/validation.utils';
import { ToastService } from '@core/services/Toast.service';
import { normalizeBackendErrors } from 'src/app/utils/error.utils';
import { handleNormalizedErrors } from 'src/app/utils/formError.utils';
import { CustomColumnsVisible } from '@components/CustomColumnsVisible/CustomColumnsVisible';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { ActionItem, CustomActionsMenu } from '@components/CustomActionsMenu/CustomActionsMenu';

type SortDir = 'asc' | 'desc';

// Convierte el término humano al formato esperado por el backend (espacios -> "_", sin acentos, minúsculas)
function toBackendSearch(term: string): string {
  return term
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .toLowerCase();
}

@Component({
  selector: 'app-roles',
  imports: [CustomHeaderTable, CustomColumnsVisible, CustomTable, CustomLoading, CustomModal, RoleForm, ReactiveFormsModule],
  templateUrl: './Roles.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Roles {
  private readonly rolesService = inject(RolesService);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  // Tabla
  readonly page = signal(1);
  readonly limit = signal(10);
  readonly sortKey = signal<string | null>(null);
  readonly sortDir = signal<SortDir>('asc');

  // Búsqueda
  readonly searchHuman = signal('');        // lo que escribe el usuario (en UI y URL)
  readonly searchDebounced = signal('');    // valor que dispara la petición (tras 500 ms o Enter/Blur)

  // Debounce imperativo (mejor control): NO hay peticiones mientras se manipula el input
  private debounceHandle: any = null;
  private readonly debounceMs = 1000;

  // Modal / formulario
  readonly adding = signal(false);


  form: FormGroup = this.fb.group({
    name: ['', required()],
    description: ['', required()],
    isSystemRole: [false],
  });
  createMutation = this.rolesService.createRoleMutation;

  constructor() {
    // Inicializa desde la URL (mantén el término humano)
    const qp = this.route.snapshot.queryParamMap;
    const qpPage = Number(qp.get('page')) || 1;
    const qpLimit = Number(qp.get('limit')) || 10;
    const qpSearchHuman = qp.get('search') || '';
    const qpSort = qp.get('sort');
    const qpOrder = (qp.get('order') as SortDir) || 'asc';

    this.page.set(qpPage);
    this.limit.set(qpLimit);
    this.searchHuman.set(qpSearchHuman);
    this.searchDebounced.set(qpSearchHuman); // primera carga usa lo que había en URL
    this.sortKey.set(qpSort);
    this.sortDir.set(qpOrder);

    // Refleja estado en la URL (siempre el término humano)
    effect(() => {
      const basePath = this.router.url.split('?')[0];
      const params = new URLSearchParams();
      params.set('page', String(this.page()));
      params.set('limit', String(this.limit()));
      if (this.searchHuman()) params.set('search', this.searchHuman());
      if (this.sortKey()) params.set('sort', this.sortKey()!);
      params.set('order', this.sortDir());
      this.location.replaceState(basePath, params.toString());
    });

    // Inicializa columnas cuando hay datos
    effect(() => {
      const data = this.query.data()?.data;
      if (data && data.length > 0 && this.allColumns().length === 0) {
        const cols = (Object.keys(data[0]) as (keyof Role)[]).map(key => ({
          key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          sortable: true
        })) as CustomTableColumn<Role>[];
        this.allColumns.set(cols);
      }
    });
  }

  // Query: SOLO depende del término "debounced" (no del input en vivo)
  readonly query = injectQuery<RolesApiResponse, Error>(() => ({
    queryKey: ['roles', this.page(), this.limit(), toBackendSearch(this.searchDebounced()), this.sortKey(), this.sortDir()],
    queryFn: () =>
      firstValueFrom(
        this.rolesService.fetchRoles({
          page: this.page(),
          limit: this.limit(),
          search: toBackendSearch(this.searchDebounced()) || undefined,
          sort: this.sortKey() || undefined,
          order: this.sortDir(),
        })
      ),
    staleTime: 2 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  }));

  // Columnas
  readonly allColumns = signal<readonly CustomTableColumn<Role>[]>([]);
  readonly hiddenColumns = signal<Set<string>>(new Set());
  readonly columns = computed(() => this.allColumns().filter(c => !this.hiddenColumns().has(c.key)));

  // Selectores de datos
  get rows() { return this.query.data()?.data ?? []; }
  get meta() { return this.query.data()?.meta ?? null; }
  get fetching() { return this.query.isFetching() || this.query.isPending(); }
  get loading() { return this.query.isLoading(); }

  // Rango “Mostrando X–Y de Z”
  get rangeStart() {
    const m = this.meta;
    if (!m) return 0;
    return (m.page - 1) * m.limit + (m.total > 0 ? 1 : 0);
  }
  get rangeEnd() {
    const m = this.meta;
    if (!m) return 0;
    return Math.min(m.page * m.limit, m.total);
  }

  // Handlers tabla
  setPage(newPage: number) { this.page.set(newPage); }
  onSort(ev: { key: string; dir: SortDir }) {
    this.sortKey.set(ev.key);
    this.sortDir.set(ev.dir);
    this.page.set(1);
  }

  // Búsqueda: mientras el usuario manipula el input NO hay peticiones
  onSearchChange(term: string) {
    this.searchHuman.set(term);
    if (this.debounceHandle) clearTimeout(this.debounceHandle);
    this.debounceHandle = setTimeout(() => {
      // 500 ms después de la última tecla, ahora sí disparamos
      this.searchDebounced.set(this.searchHuman());
      this.page.set(1);
    }, this.debounceMs);
  }

  // Enter o Blur: dispara inmediatamente (ignora el debounce)
  forceSearchNow() {
    if (this.debounceHandle) clearTimeout(this.debounceHandle);
    this.searchDebounced.set(this.searchHuman());
    this.page.set(1);
  }

  // Modal
  openAdd() {
    this.adding.set(true);
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
  closeAdd() {
    this.adding.set(false);
    this.form.reset({ name: '', description: '', isSystemRole: false });
  }

  // Columnas visibles
  toggleColumn(key: string) {
    const next = new Set(this.hiddenColumns());
    next.has(key) ? next.delete(key) : next.add(key);
    this.hiddenColumns.set(next);
  }
  showAllColumns() { this.hiddenColumns.set(new Set()); }
  hideAllColumns() {
    const allKeys = this.allColumns().map(c => c.key);
    this.hiddenColumns.set(new Set(allKeys));
  }

  // Crear rol y refrescar
  submitRole(payload: Role) {
    this.createMutation.mutate(payload, {
      onSuccess: async () => {
        this.toast.show('Rol creado correctamente', 'success');
        this.query.refetch();
        this.form.reset({ name: '', description: '', isSystemRole: false });
        this.form.markAsPristine();
        this.form.markAsUntouched();
      },
      onError: (err: unknown) => {
        const errorBody = err && typeof err === 'object' && 'error' in err
          ? (err as { error: unknown }).error
          : err;
        const normalized = normalizeBackendErrors(errorBody);
        handleNormalizedErrors(normalized, this.form, (msg) => this.toast.show(msg, 'error'));
      }
    });
  }
}
