import { ColumnDef, createColumnHelper } from '@tanstack/angular-table';
import type { Role, ApiColumnSpec } from '../../interfaces/Roles';

const ch = createColumnHelper<Role>();

export function mapApiColumnsToDefs(specs: ApiColumnSpec[]): ColumnDef<Role, any>[] {
  return specs
    .filter(spec => spec.visible !== false) // visibles por defecto
    .map(spec =>
      ch.accessor(spec.key as keyof Role, {
        header: spec.label,
        enableSorting: !!spec.sortable,
        cell: (info) => info.getValue(), // AutoCell pipe formateará en el template
      })
    );
}

export const staticRoleColumns: ColumnDef<Role, any>[] = [
  ch.accessor('id',           { header: 'ID',           enableSorting: true }),
  ch.accessor('name',         { header: 'Nombre',       enableSorting: true }),
  ch.accessor('description',  { header: 'Descripción',  enableSorting: false }),
  ch.accessor('isSystemRole', { header: 'Sistema',      enableSorting: true }),
  ch.accessor('createdAt',    { header: 'Creado',       enableSorting: true }),
];
