import { ChangeDetectionStrategy, Component, computed, effect, inject, Signal, signal } from '@angular/core';
import { RolesService } from '../../services/Roles.service';
import { CreateQueryResult } from '@tanstack/angular-query-experimental';
import { Role, RolesApiResponse } from '../../interfaces/Roles';
import { CustomTable, CustomTableColumn } from "@components/CustomTable/CustomTable";
import { JsonPipe } from '@angular/common';
import { CustomLoading } from "@components/CustomLoading/CustomLoading";

@Component({
  selector: 'app-roles',
  imports: [CustomTable, CustomLoading],
  templateUrl: './Roles.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Roles {
  private readonly rolesService = inject(RolesService);

  readonly page = signal(1);
  readonly limit = signal(10);

  query: CreateQueryResult<RolesApiResponse, Error>;
  readonly columns = signal<readonly CustomTableColumn<Role>[]>([]);

  constructor() {
    this.query = this.rolesService.getRolesQuery({
      page: this.page(),
      limit: this.limit()
    });

    effect(() => {
      const data = this.query.data()?.data;
      if (data && data.length > 0) {
        // Castea las keys a las del modelo Role
        this.columns.set(
          (Object.keys(data[0]) as (keyof Role)[]).map(key => ({
            key,
            label: key.charAt(0).toUpperCase() + key.slice(1),
          })) as CustomTableColumn<Role>[] // <-- Esto asegura el tipado
        );
      }
    });
  }

  get roles() {
    return this.query.data()?.data ?? [];
  }
  get meta() {
    return this.query.data()?.meta ?? null;
  }
  get fetching() {
    return this.query.isFetching() || this.query.isPending();
  }

  get loading() {
    return this.query.isLoading()
  }

  setPage(newPage: number) {
    this.page.set(newPage);
    this.query = this.rolesService.getRolesQuery({
      page: this.page(),
      limit: this.limit()
    });
  }
}
