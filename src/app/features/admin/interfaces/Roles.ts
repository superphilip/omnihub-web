export interface Role {
  id: string;
  name: string;
  description?: string;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface RolesApiMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RolesApiResponse {
  success: boolean;
  data: Role[];
  meta: RolesApiMeta;
}
