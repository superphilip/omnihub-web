import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnDestroy, input, output, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ActionItem = {
  key: string;
  label: string;
  icon?: string;
  colorClass?: string; // 'text-[#2B5797]' | 'text-emerald-600' | 'text-red-600'
};

@Component({
  selector: 'custom-actions-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './CustomActionsMenu.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomActionsMenu implements OnDestroy {
  items = input<readonly ActionItem[]>([]);
  action = output<string>();

  open = signal(false);
  ready = signal(false); // visible solo cuando ya está posicionado
  panelTop = signal(0);
  panelLeft = signal(0);

  @ViewChild('originBtn', { static: true }) originBtn!: ElementRef<HTMLButtonElement>;
  @ViewChild('panelEl') panelEl?: ElementRef<HTMLDivElement>;

  private readonly PANEL_WIDTH = 256; // w-64
  private readonly MARGIN = 8;

  // Singleton para asegurar un único menú abierto
  private static active: CustomActionsMenu | null = null;

  // Abrir/cerrar con mejor orden: pointerdown evita “flash”
  onTogglePointerDown(ev: PointerEvent) {
    ev.preventDefault();
    ev.stopPropagation();

    if (!this.open()) {
      // Cierra el activo en otra parte antes de abrir este
      if (CustomActionsMenu.active && CustomActionsMenu.active !== this) {
        CustomActionsMenu.active.close();
      }
      CustomActionsMenu.active = this;
      this.open.set(true);
      this.ready.set(false);
      // Espera a pintar y posiciona; muestra después sin salto
      requestAnimationFrame(() => {
        this.reposition();
        requestAnimationFrame(() => this.ready.set(true));
      });
    } else {
      this.close();
    }
  }

  close() {
    if (!this.open()) return;
    this.open.set(false);
    this.ready.set(false);
    if (CustomActionsMenu.active === this) {
      CustomActionsMenu.active = null;
    }
  }

  select(key: string) {
    this.action.emit(key);
    this.close();
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  onWindowChange() {
    if (this.open()) {
      this.reposition();
    }
  }

  // Cierra por click fuera (burbuja)
  @HostListener('document:click', ['$event'])
  onDocumentClick(ev: MouseEvent) {
    if (!this.open()) return;
    const target = ev.target as Node | null;
    const origin = this.originBtn?.nativeElement;
    const panel = this.panelEl?.nativeElement;
    const insideOrigin = !!(origin && target && origin.contains(target));
    const insidePanel = !!(panel && target && panel.contains(target));
    if (!insideOrigin && !insidePanel) this.close();
  }

  private reposition() {
    const origin = this.originBtn?.nativeElement;
    if (!origin) return;

    const rect = origin.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    const panelW = this.panelEl?.nativeElement?.offsetWidth ?? this.PANEL_WIDTH;
    const panelH = this.panelEl?.nativeElement?.offsetHeight ?? 200;

    // Debajo preferido; si no cabe, arriba
    let top = rect.bottom + this.MARGIN;
    if (top + panelH > viewportH) top = rect.top - this.MARGIN - panelH;

    // Alineado al borde derecho del botón dentro del viewport
    let left = rect.right - panelW;
    left = Math.max(this.MARGIN, Math.min(left, viewportW - panelW - this.MARGIN));

    this.panelTop.set(Math.max(this.MARGIN, top));
    this.panelLeft.set(left);
  }

  ngOnDestroy() {
    if (CustomActionsMenu.active === this) {
      CustomActionsMenu.active = null;
    }
  }
}
