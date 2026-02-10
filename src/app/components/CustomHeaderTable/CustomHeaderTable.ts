import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'custom-header-table',
  imports: [CommonModule],
  templateUrl: './CustomHeaderTable.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomHeaderTable {
  // UI
  title = input<string>('Título');
  subtitle = input<string>('');

  // Buscador
  search = input<string>('');
  searchPlaceholder = input<string>('Buscar...');
  searchChange = output<string>();

  // Acciones
  requestOpen = output<void>();   // clic en “+”

  // Opcionales
  showAdd = input<boolean>(true);
  showSearch = input<boolean>(true);

  onSearchInput(ev: Event) {
    const value = (ev.target as HTMLInputElement)?.value ?? '';
    this.searchChange.emit(value);
  }
}
