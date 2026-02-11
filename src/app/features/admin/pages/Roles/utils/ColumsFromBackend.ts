import { ColumnDef, createColumnHelper } from '@tanstack/angular-table';
import { TranslateService } from '@ngx-translate/core';
import { ApiColumnSpec, Role } from '../interfaces/Roles';

const ch = createColumnHelper<Role>();

// Clave de header para i18n
const toKey = (spec: ApiColumnSpec) => spec.labelKey ?? `roles.columns.${spec.key}`;

// Traducción/formateo de valores de celda
function translateCell(info: any, colKey: string, value: unknown): unknown {
  const meta = info.table.options.meta as { translate: TranslateService } | undefined;
  const t = meta?.translate;
  const lang = t?.currentLang ?? 'es';

  switch (colKey) {
    case 'status': {
      const key = `roles.status.${String(value)}`;
      return t ? t.instant(key) : key; // fallback: devuelve la clave si no hay servicio
    }
    case 'isSystemRole': {
      const key = value ? 'common.yes' : 'common.no';
      return t ? t.instant(key) : key;
    }
    case 'createdAt': {
      if (!value) return '';
      try {
        const d = new Date(String(value));
        const locale = lang === 'en' ? 'en-US' : 'es-ES';
        return new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
      } catch {
        return String(value);
      }
    }
    default:
      return value;
  }
}

export function mapApiColumnsToDefs(specs: ApiColumnSpec[]): ColumnDef<Role, any>[] {
  return specs
    .filter(spec => spec.visible !== false)
    .map(spec =>
      ch.accessor(spec.key as keyof Role, {
        header: toKey(spec),                 // clave para | translate en el header
        enableSorting: !!spec.sortable,
        cell: (info) => translateCell(info, String(spec.key), info.getValue()),
      })
    );
}

// Columnas estáticas con traducción/formateo en celdas
export const staticRoleColumns: ColumnDef<Role, any>[] = [
  ch.accessor('id',           { header: 'roles.columns.id',           enableSorting: true,  cell: (info) => info.getValue() }),
  ch.accessor('name',         { header: 'roles.columns.name',         enableSorting: true,  cell: (info) => info.getValue() }),
  ch.accessor('description',  { header: 'roles.columns.description',  enableSorting: false, cell: (info) => info.getValue() }),
  ch.accessor('isSystemRole', { header: 'roles.columns.isSystemRole', enableSorting: true,  cell: (info) => translateCell(info, 'isSystemRole', info.getValue()) }),
  ch.accessor('createdAt',    { header: 'roles.columns.createdAt',    enableSorting: true,  cell: (info) => translateCell(info, 'createdAt', info.getValue()) }),
];
