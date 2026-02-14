export type ColumnType = 'text' | 'date' | 'bool' | 'number';

export interface ApiColumnSpec {
  key: string;
  label: string;
  sortable?: boolean;
  visible?: boolean;
  type?: ColumnType;
  format?: string;
}

export interface Role {
  id: string | number;
  name: string;
  description?: string;
  isSystemRole: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface CreateRole {
  name: string;
  description?: string;
  isSystemRole: boolean;
}

export interface RolesApiResponse {
  data: Role[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  columns?: ApiColumnSpec[]; // opcional: cuando el backend envía include=columns
}
