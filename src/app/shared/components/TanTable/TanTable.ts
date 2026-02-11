import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  createTable,
  getCoreRowModel,
  getSortedRowModel,
  // getFilteredRowModel,
  type Table,
  type ColumnDef,
  type SortingState,
  type VisibilityState,
  type Updater,
  Header,
} from '@tanstack/angular-table';

import { AutoCellPipe } from '@core/pipes/AutoCell.pipe';
import { TranslocoModule } from '@ngneat/transloco';
import { ActionItem, CustomActionsMenu } from '../CustomActionsMenu/CustomActionsMenu';

export interface BaseEntity { id: string | number; }

@Component({
  selector: 'tan-table',
  standalone: true,
  imports: [CommonModule, CustomActionsMenu, AutoCellPipe, TranslocoModule],
  templateUrl: './TanTable.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TanTable<T extends BaseEntity> {
  data = input<readonly T[]>([]);
  columns = input<readonly ColumnDef<T, any>[]>([]);
  pageSize = input<number>(10);
  globalFilter = input<string>('');
  columnVisibilityIn = input<VisibilityState>({});
  rowActions = input<(row: T) => readonly ActionItem[]>();

  totalPagesIn = input<number>(1);
  totalCountIn = input<number>(0);

  edit = output<T>();
  details = output<T>();
  delete = output<T>();
  pageChange = output<number>(); // 0-based
  sortingChange = output<SortingState>();
  visibilityChange = output<VisibilityState>();

  readonly sorting = signal<SortingState>([]);
  readonly columnVisibility = signal<VisibilityState>({});
  readonly pageIndex = signal(0);

  private tableSig = signal<Table<any> | null>(null);

  readonly tableRows = computed(() => this.tableSig()?.getRowModel().rows ?? []);
  readonly headerGroups = computed(() => this.tableSig()?.getHeaderGroups() ?? []);

  readonly pageCount = computed(() => Math.max(1, this.totalPagesIn() ?? 1));
  readonly canPrev = computed(() => this.pageIndex() > 0);
  readonly canNext = computed(() => (this.pageIndex() + 1) < this.pageCount());
  readonly pages = computed(() => Array.from({ length: this.pageCount() }, (_, i) => i));

  currentPageIndex(): number { return this.pageIndex(); }
  totalRowCount(): number { return this.totalCountIn() ?? (this.tableSig()?.getRowCount() ?? 0); }

  getHeaderText(header: Header<T, unknown>): string {
    const def = header.column.columnDef.header;
    return typeof def === 'string' ? def : header.column.id;
  }

  constructor() {
    effect(() => {
      const vis = this.columnVisibilityIn();
      this.columnVisibility.set(vis);
      const inst = this.tableSig();
      if (inst) inst.setColumnVisibility(vis);
    });

    // Instancia SIN paginación local (server-side)
    effect(() => {
      const data = this.data() as T[];
      const cols = this.columns() as ColumnDef<T, any>[];
      const sorting = this.sorting();
      const columnVisibility = this.columnVisibility();
      const globalFilter = this.globalFilter();

      if (!Array.isArray(cols) || cols.length === 0) {
        this.tableSig.set(null);
        return;
      }

      const inst = createTable({
        data: data as any[],
        columns: cols as unknown as ColumnDef<any, any>[],
        state: {
          sorting,
          columnVisibility,
          globalFilter,
          pagination: { pageIndex: 0, pageSize: this.pageSize() }, // no recortar data
          columnPinning: { left: [], right: [] },
        },
        onStateChange: (updater: Updater<any>) => {
          const prev = this.tableSig()?.getState() ?? {
            sorting: this.sorting(),
            columnVisibility: this.columnVisibility(),
            globalFilter: this.globalFilter(),
            pagination: { pageIndex: 0, pageSize: this.pageSize() },
            columnPinning: { left: [], right: [] },
          };
          const next = typeof updater === 'function' ? updater(prev) : updater;
          if (next?.sorting) this.sorting.set(next.sorting);
          if (next?.columnVisibility) this.columnVisibility.set(next.columnVisibility);
        },

        enableSorting: true,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        // getFilteredRowModel: getFilteredRowModel(),
        renderFallbackValue: null,
      });

      this.tableSig.set(inst);
    });
  }

  toggleSort(header: any) {
    const inst = this.tableSig();
    if (!inst || !header?.column?.getCanSort?.()) return;

    const cur = this.sorting();
    const colId = header.column.id as string;
    const existing = cur.find((s) => s.id === colId);
    let dir: 'asc' | 'desc' | false = 'asc';
    if (existing) dir = existing.desc ? false : 'desc';
    const next = cur.filter((s) => s.id !== colId);
    if (dir) next.push({ id: colId, desc: dir === 'desc' });

    this.sorting.set(next);
    inst.setSorting(next);
    this.sortingChange.emit(next);
  }

  getActions(row: T): readonly ActionItem[] {
    const builder = this.rowActions();
    return builder ? builder(row) : [
      { key: 'edit', label: 'Editar', icon: 'fa-solid fa-pen-to-square', colorClass: 'text-[#2B5797]' },
      { key: 'details', label: 'Detalles', icon: 'fa-solid fa-circle-info', colorClass: 'text-emerald-600' },
      { key: 'delete', label: 'Eliminar', icon: 'fa-solid fa-trash', colorClass: 'text-red-600' },
    ];
  }

  onRowAction(action: string, row: T) {
    switch (action) {
      case 'edit': this.edit.emit(row); break;
      case 'details': this.details.emit(row); break;
      case 'delete': this.delete.emit(row); break;
      default: console.warn('Acción desconocida:', action);
    }
  }

  prev() {
    const target = Math.max(0, this.pageIndex() - 1);
    if (target !== this.pageIndex()) this.goTo(target);
  }
  next() {
    const target = Math.min(this.pageCount() - 1, this.pageIndex() + 1);
    if (target !== this.pageIndex()) this.goTo(target);
  }
  goTo(pageZeroBased: number) {
    this.pageIndex.set(pageZeroBased);
    this.pageChange.emit(pageZeroBased);
  }
}
