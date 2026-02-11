import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomTabs, TabItem } from '@components/CustomTabs/CustomTabs';
// Reutilizamos tu página de Roles ya existente
import Roles from '../Roles/Roles';
import { AssignPermissions } from '../AssignPermissions/AssignPermissions';
import { Permissions } from '../Permissions/Permissions';



@Component({
  selector: 'app-access-manager',
  standalone: true,
  imports: [CommonModule, CustomTabs, Roles, Permissions, AssignPermissions],
  templateUrl: './AccessManager.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AccessManager {
  readonly tabs: TabItem[] = [
    { key: 'roles',       label: 'Gestor de Roles',     icon: 'fa-solid fa-users-gear' },
    { key: 'permisos',    label: 'Gestor de Permisos',  icon: 'fa-solid fa-key' },
    { key: 'asignacion',  label: 'Asignación de Permisos', icon: 'fa-solid fa-user-check' },
  ];

  active = signal<string>('roles');

  setActive = (key: string) => {
    this.active.set(key);
  };

  title = computed(() => 'Gestor de Accesos');
  subtitle = computed(() => 'Centraliza la administración de roles y permisos');
}
