import { ChangeDetectionStrategy, Component, HostListener, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type TabItem = { key: string; label: string; icon?: string };

@Component({
  selector: 'custom-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './CustomTabs.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomTabs {
  tabs = input<readonly TabItem[]>([]);
  active = input<string>('');
  change = output<string>();

  // soporte de foco/teclado simple
  private index = signal(0);

  setActive(key: string, i: number) {
    this.index.set(i);
    this.change.emit(key);
  }

  @HostListener('keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (!this.tabs().length) return;
    const max = this.tabs().length - 1;
    const cur = this.index();
    if (e.key === 'ArrowRight') {
      const i = Math.min(cur + 1, max);
      this.index.set(i);
      this.change.emit(this.tabs()[i].key);
      e.preventDefault();
    }
    if (e.key === 'ArrowLeft') {
      const i = Math.max(cur - 1, 0);
      this.index.set(i);
      this.change.emit(this.tabs()[i].key);
      e.preventDefault();
    }
  }
}
