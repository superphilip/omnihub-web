import type { ColumnDef } from '@tanstack/angular-table';
import { ApiColumnSpec, Role } from '../interfaces/Roles';


export const staticRoleColumns: readonly ColumnDef<Role, any>[] = [
  { id: 'name', header: 'roles.columns.name', accessorKey: 'name' },
  { id: 'description', header: 'roles.columns.description', accessorKey: 'description' },
  { id: 'isSystemRole', header: 'roles.columns.isSystemRole', accessorKey: 'isSystemRole' },
  { id: 'createdAt', header: 'roles.columns.createdAt', accessorKey: 'createdAt' },
];

export function mapApiColumnsToDefs(apiCols: ApiColumnSpec[]): readonly ColumnDef<Role, any>[] {
  return apiCols.map(col => {
    const key = String(col.key);
    const headerKey = `roles.columns.${key}`;
    return {
      id: key,
      header: headerKey,
      accessorKey: key,
      // puedes añadir meta.type/format si tu AutoCell pipe los usa:
      meta: { type: col.type, format: col.format, sortable: col.sortable !== false },
    } as ColumnDef<Role, any>;
  });
}
