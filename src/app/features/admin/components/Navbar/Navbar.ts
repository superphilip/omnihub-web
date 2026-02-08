import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './Navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  onMenuClick = output<void>();

  emitClick() {
    this.onMenuClick.emit();
  }
}
