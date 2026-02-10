import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'custom-header-table',
  standalone: true,
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
  searchChange = output<string>();   // emite mientras escribe; el padre aplica debounce
  searchSubmit = output<void>();     // Enter -> búsqueda inmediata
  searchBlur = output<void>();       // Blur -> búsqueda inmediata

  // Acciones
  requestOpen = output<void>();      // clic en “+”

  // Opcionales
  showAdd = input<boolean>(true);
  showSearch = input<boolean>(true);

  // Manejo de IME
  private composing = false;

  onSearchInput(ev: Event) {
    const value = (ev.target as HTMLInputElement)?.value ?? '';
    this.searchChange.emit(value);
  }

  onSearchEnter() {
    if (!this.composing) {
      this.searchSubmit.emit();
    }
  }

  onSearchBlur() {
    if (!this.composing) {
      this.searchBlur.emit();
    }
  }

  onCompositionStart() {
    this.composing = true;
  }

  onCompositionEnd(ev: CompositionEvent) {
    this.composing = false;
    const target = ev.target as HTMLInputElement | null;
    if (target) {
      this.searchChange.emit(target.value ?? '');
    }
  }
}
