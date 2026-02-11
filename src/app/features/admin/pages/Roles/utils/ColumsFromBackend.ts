import { ColumnDef, createColumnHelper } from '@tanstack/angular-table';
import { ApiColumnSpec, Role } from '../interfaces/Roles';


const ch = createColumnHelper<Role>();
const toKey = (spec: ApiColumnSpec) => spec.labelKey ?? `roles.columns.${spec.key}`;

export function mapApiColumnsToDefs(specs: ApiColumnSpec[]): ColumnDef<Role, any>[] {
  return specs
    .filter(spec => spec.visible !== false)
    .map(spec =>
      ch.accessor(spec.key as keyof Role, {
        header: toKey(spec),                 // ← string para transloco
        enableSorting: !!spec.sortable,
        cell: (info) => info.getValue(),
      })
    );
}

export const staticRoleColumns: ColumnDef<Role, any>[] = [
  ch.accessor('id',           { header: 'roles.columns.id',           enableSorting: true }),
  ch.accessor('name',         { header: 'roles.columns.name',         enableSorting: true }),
  ch.accessor('description',  { header: 'roles.columns.description',  enableSorting: false }),
  ch.accessor('isSystemRole', { header: 'roles.columns.isSystemRole', enableSorting: true }),
  ch.accessor('createdAt',    { header: 'roles.columns.createdAt',    enableSorting: true }),
];
