import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { LanguageSwitcherTs } from "src/app/shared/components/LanguageSwitcher.ts/LanguageSwitcher";

@Component({
  selector: 'app-navbar',
  imports: [LanguageSwitcherTs],
  templateUrl: './Navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  onMenuClick = output<void>();

  emitClick() {
    this.onMenuClick.emit();
  }
}
