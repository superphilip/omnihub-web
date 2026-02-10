import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RolesService } from '../../services/Roles.service';
import { CreateQueryResult } from '@tanstack/angular-query-experimental';
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

  readonly page = signal(1);
  readonly limit = signal(10);

  query!: CreateQueryResult<RolesApiResponse, Error>;

  // Columnas: todas vs visibles
  readonly allColumns = signal<readonly CustomTableColumn<Role>[]>([]);
  readonly hiddenColumns = signal<Set<string>>(new Set());
  readonly columns = computed(() => this.allColumns().filter(c => !this.hiddenColumns().has(c.key)));

  // UI header / modal / form
  readonly adding = signal(false);
  readonly search = signal('');

  form: FormGroup = this.fb.group({
    name: ['', required()],
    description: ['', required()],
    isSystemRole: [false],
  });

  createMutation = this.rolesService.createRoleMutation;

  constructor() {
    this.query = this.rolesService.getRolesQuery({ page: this.page(), limit: this.limit() });

    effect(() => {
      const data = this.query.data()?.data;
      if (data && data.length > 0 && this.allColumns().length === 0) {
        // Inicializa columnas a partir del primer registro
        const cols = (Object.keys(data[0]) as (keyof Role)[]).map(key => ({
          key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
          sortable: true
        })) as CustomTableColumn<Role>[];
        this.allColumns.set(cols);
      }
    });
  }

  get rows() { return this.query.data()?.data ?? []; }
  get meta() { return this.query.data()?.meta ?? null; }
  get fetching() { return this.query.isFetching() || this.query.isPending(); }
  get loading() { return this.query.isLoading(); }

  setPage(newPage: number) {
    this.page.set(newPage);
    this.query = this.rolesService.getRolesQuery({ page: this.page(), limit: this.limit(), /* search: this.search() */ });
  }

  // Header actions
  openAdd() {
    this.adding.set(true);
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
  closeAdd() {
    this.adding.set(false);
    this.form.reset({ name: '', description: '', isSystemRole: false });
  }
  onSearchChange(term: string) {
    this.search.set(term);
    // this.query = this.rolesService.getRolesQuery({ page: 1, limit: this.limit(), search: term });
  }

  // Columns menu actions
  toggleColumn(key: string) {
    const next = new Set(this.hiddenColumns());
    next.has(key) ? next.delete(key) : next.add(key);
    this.hiddenColumns.set(next);
  }
  showAllColumns() {
    this.hiddenColumns.set(new Set());
  }
  hideAllColumns() {
    const allKeys = this.allColumns().map(c => c.key);
    this.hiddenColumns.set(new Set(allKeys));
  }

  // Form submit
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
