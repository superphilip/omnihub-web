import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AutoCellPipe } from '@core/pipes/AutoCell.pipe';
import { CustomInput } from "@components/CustomInput/CustomInput";


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
  event?: 'delete' | 'details' | 'edit'; // Eventos para acciones manuales
  link?: string;                         // Ruta para navegación
  class?: string;
  exact?: boolean;                       // Para routerLinkActiveOptions
}

export interface BaseEntity {
  id: string | number;
}

@Component({
  selector: 'custom-table',
  imports: [AutoCellPipe, RouterLink, RouterLinkActive],
  templateUrl: './CustomTable.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomTable<T extends BaseEntity> {
  details = output<T>();
  edit = output<T>();
  delete = output<T>();

  menuOptions = signal<TableAction[]>([
    {
      label: 'Editar',
      icon: 'fa-solid fa-pen-to-square',
      event: 'edit', // Esto es para que el componente sepa que es una acción manual
      class: 'text-blue-500 font-bold hover:bg-blue-50',
      link: '/edit', // Esto es para que el componente genere un routerLink
      exact: true,

    },
    {
      label: 'Detalles',
      icon: 'fa-solid fa-circle-info',
      event: 'details',
      class: 'text-green-500 font-bold hover:bg-green-50',
      link: '/details',
      exact: true,
    },
    {
      label: 'Eliminar',
      icon: 'fa-solid fa-trash-can',
      event: 'delete', // Este sigue siendo un evento (abre un modal de confirmación)
      class: 'text-red-500 font-bold hover:bg-red-50',
      link: '/delete',
      exact: true,
    }
  ]);



  getRowId(row: T): string | number {
    return row.id; // Funciona porque T ahora extiende de BaseEntity
  }

  handleAction(event: 'edit' | 'details' | 'delete' | undefined, row: any) {
    if (!event) return; // Si es un link puro, no hace nada por evento

    switch (event) {
      case 'edit':
        this.edit.emit(row);
        break;
      case 'details':
        this.details.emit(row);
        break;
      case 'delete':
        this.delete.emit(row);
        break;
    }
  }

  rows = input<readonly T[]>([]);
  columns = input<readonly CustomTableColumn<T>[]>([]);
  hiddenColumns = signal<Set<string>>(new Set());
  meta = input<CustomTableMeta | null>(null);
  Label = input<string>('Titulo por defecto');
  SubLabel = input<string>('Description por defecto');

  selectedRows = signal<Set<number>>(new Set<number>());
  selectAll = signal(false);
  sortKey = signal<keyof T | null>(null);
  sortDir = signal<SortDir>('asc');
  page = signal(1);

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
        if (typeof va === 'number' && typeof vb === 'number') {
          return (va - vb) * direction;
        } else if (typeof va === 'string' && typeof vb === 'string') {
          return va.localeCompare(vb) * direction;
        } else if (va instanceof Date && vb instanceof Date) {
          return (va.getTime() - vb.getTime()) * direction;
        }
        return 0;
      });
    }
    return arr;
  });
  create = output<void>();
  checkedChange = output<readonly T[]>();
  pageChange = output<number>();
  sortChange = output<{ key: keyof T & string; dir: SortDir }>();

  toggleSelectAll(checked: boolean) {
    const selection = checked
      ? new Set<number>(this.rows().map((_, i) => i))
      : new Set<number>();
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

  toggleColumn(key: string) {
    this.hiddenColumns.update(set => {
      const copy = new Set(set);
      if (copy.has(key)) copy.delete(key);
      else copy.add(key);
      return copy;
    });
  }

  setSort(col: CustomTableColumn<T>) {
    if (!col.sortable) return;
    if (this.sortKey() === col.key) {
      this.sortDir.set(this.sortDir() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortKey.set(col.key);
      this.sortDir.set('asc');
    }
    this.sortChange.emit({ key: col.key, dir: this.sortDir() });
  }

  goToPage(page: number) {
    this.page.set(page);
    this.pageChange.emit(page);
  }

  getCellValue(row: T, col: CustomTableColumn<T>) {
    return col.render ? col.render(row) : row[col.key];
  }
}


