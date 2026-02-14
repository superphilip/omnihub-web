import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, input, output } from '@angular/core';

@Component({
  selector: 'custom-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './CustomModal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomModal {
  open = input<boolean>(false);
  title = input<string>('');
  closeOnBackdrop = input<boolean>(true);
  escEnabled = input<boolean>(true);
  maxWidth = input<string>('640px');

  close = output<void>();

  onBackdropClick() {
    if (this.closeOnBackdrop()) this.close.emit();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (this.escEnabled() && e.key === 'Escape' && this.open()) {
      this.close.emit();
    }
  }
}
