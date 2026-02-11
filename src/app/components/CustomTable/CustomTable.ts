import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, input, output, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AutoCellPipe } from '@core/pipes/AutoCell.pipe';
import { ActionItem, CustomActionsMenu } from '@components/CustomActionsMenu/CustomActionsMenu';

export type SortDir = 'asc' | 'desc';

export interface CustomTableColumn<T extends object> {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  cellClass?: string;
  render?: (row: T) => string | number | boolean | undefined;
}

export interface CustomTableMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface TableAction {
  label: string;
  icon: string;
  event?: 'delete' | 'details' | 'edit';
  link?: string;
  class?: string;
  exact?: boolean;
}

export interface BaseEntity {
  id: string | number;
}

@Component({
  selector: 'custom-table',
  standalone: true,
  imports: [CommonModule, AutoCellPipe, CustomActionsMenu],
  templateUrl: './CustomTable.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomTable<T extends BaseEntity> {
  // Outputs de acciones
  details = output<T>();
  edit = output<T>();
  delete = output<T>();

  // Inputs
  rows = input<readonly T[]>([]);
  columns = input<readonly CustomTableColumn<T>[]>([]);
  meta = input<CustomTableMeta | null>(null);

  // Estado
  hiddenColumns = signal<Set<string>>(new Set());
  selectedRows = signal<Set<number>>(new Set<number>());
  selectAll = signal(false);
  sortKey = signal<keyof T | null>(null);
  sortDir = signal<SortDir>('asc');

  // Derivados
  isAllSelected = computed(() =>
    this.rows().length > 0 && this.rows().every((_, i) => this.selectedRows().has(i))
  );

  readonly visibleColumns = computed(() =>
    this.columns().filter(col => !this.hiddenColumns().has(col.key))
  );

  visualRows = computed<readonly T[]>(() => {
    const arr = [...this.rows()];
    const key = this.sortKey();
    if (key) {
      const direction = this.sortDir() === 'asc' ? 1 : -1;
      arr.sort((a, b) => {
        const va = a[key];
        const vb = b[key];
        if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * direction;
        else if (typeof va === 'string' && typeof vb === 'string') return va.localeCompare(vb) * direction;
        else if (va instanceof Date && vb instanceof Date) return (va.getTime() - vb.getTime()) * direction;
        return 0;
      });
    }
    return arr;
  });

  // Paginación (derivados desde meta)
  currentPage = computed(() => this.meta()?.page ?? 1);
  totalPages = computed(() => this.meta()?.totalPages ?? 1);
  totalItems = computed(() => this.meta()?.total ?? this.rows().length);

  @ViewChild('paginationBar', { static: false }) paginationBar?: ElementRef<HTMLDivElement>;

  constructor() {
    // Solo resetea selección al cambiar de página (NO hace scroll automático)
    effect(() => {
      this.currentPage();
      this.selectedRows.set(new Set());
      this.selectAll.set(false);
    });
  }

  private scrollPaginationIntoView() {
    const el = this.paginationBar?.nativeElement;
    const doScroll = () => {
      if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'end', inline: 'nearest' });
      } else if (typeof window !== 'undefined') {
        window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'auto' });
      }
    };
    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(doScroll);
    } else {
      setTimeout(doScroll, 0);
    }
  }

  pagesWindow = computed(() => {
    const current = this.currentPage();
    const total = this.totalPages();
    const spread = 2;
    const pages: (number | '…')[] = [];
    if (total <= 1) return [1];

    const add = (p: number) => { if (!pages.includes(p)) pages.push(p); };
    const dot = () => { if (pages[pages.length - 1] !== '…') pages.push('…'); };

    add(1);
    if (current - spread > 2) dot();
    for (let p = Math.max(2, current - spread); p <= Math.min(total - 1, current + spread); p++) add(p);
    if (current + spread < total - 1) dot();
    add(total);
    return pages;
  });

  // Outputs tabla
  checkedChange = output<readonly T[]>();
  pageChange = output<number>();
  sortChange = output<{ key: keyof T & string; dir: SortDir }>();

  // Selección
  toggleSelectAll(checked: boolean) {
    const selection = checked ? new Set<number>(this.rows().map((_, i) => i)) : new Set<number>();
    this.selectedRows.set(selection);
    this.selectAll.set(checked);
    this.checkedChange.emit(this.rows().filter((_, i) => selection.has(i)));
  }

  toggleSelectRow(index: number) {
    const sel = new Set<number>(this.selectedRows());
    sel.has(index) ? sel.delete(index) : sel.add(index);
    this.selectedRows.set(sel);
    this.selectAll.set(this.rows().length > 0 && this.rows().every((_, i) => sel.has(i)));
    this.checkedChange.emit(this.rows().filter((_, i) => sel.has(i)));
  }

  // Columnas visibles
  toggleColumn(key: string) {
    this.hiddenColumns.update(set => {
      const copy = new Set(set);
      if (copy.has(key)) copy.delete(key);
      else copy.add(key);
      return copy;
    });
  }

  // Orden
  setSort(col: CustomTableColumn<T>) {
    if (!col.sortable) return;
    if (this.sortKey() === col.key) this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    else { this.sortKey.set(col.key); this.sortDir.set('asc'); }
    this.sortChange.emit({ key: col.key, dir: this.sortDir() });
  }

  // Track por id seguro para el template
  getRowId(row: T): string | number {
    return row.id;
  }

  // Paginación: SOLO hace scroll cuando el usuario usa paginación
  goToPage(page: number) {
    const total = this.totalPages();
    const target = Math.min(Math.max(1, page), total);
    if (target !== this.currentPage()) {
      this.pageChange.emit(target);
      this.scrollPaginationIntoView(); // scroll ONLY triggered on pagination
    }
  }
  prev() { this.goToPage(this.currentPage() - 1); }
  next() { this.goToPage(this.currentPage() + 1); }

  // Celda
  getCellValue(row: T, col: CustomTableColumn<T>) {
    return col.render ? col.render(row) : row[col.key];
  }
  rowActions = input<(row: T) => readonly ActionItem[]>();
  private defaultRowActions(): readonly ActionItem[] {
    return [
      { key: 'edit',    label: 'Editar',   icon: 'fa-solid fa-pen-to-square', colorClass: 'text-[#2B5797]' },
      { key: 'details', label: 'Detalles', icon: 'fa-solid fa-circle-info',   colorClass: 'text-emerald-600' },
      { key: 'delete',  label: 'Eliminar', icon: 'fa-solid fa-trash',         colorClass: 'text-red-600' },
    ];
  }

  getRowActions(row: T): readonly ActionItem[] {
    const builder = this.rowActions();
    return builder ? builder(row) : this.defaultRowActions();
  }

  onRowAction(action: string, row: T) {
    switch (action) {
      case 'edit':    this.edit.emit(row);    break;
      case 'details': this.details.emit(row); break;
      case 'delete':  this.delete.emit(row);  break;
      default:        console.warn('Acción desconocida:', action);
    }
  }
}

