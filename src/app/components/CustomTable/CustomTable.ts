import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

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

@Component({
  selector: 'custom-table',
  imports: [],
  templateUrl: './CustomTable.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomTable<T extends object> {
  rows = input<readonly T[]>([]);
  columns = input<readonly CustomTableColumn<T>[]>([]);
  meta = input<CustomTableMeta | null>(null);

  selectedRows = signal<Set<number>>(new Set<number>());
  selectAll = signal(false);
  sortKey = signal<keyof T | null>(null);
  sortDir = signal<SortDir>('asc');
  page = signal(1);

  isAllSelected = computed(() =>
    this.rows().length > 0 && this.rows().every((_, i) => this.selectedRows().has(i))
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

  details = output<T>();
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


