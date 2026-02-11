import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '@core/services/I18.service';

@Component({
  selector: 'language-switcher',
  imports: [],
  templateUrl: './LanguageSwitcher.ts.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSwitcherTs {
  i18n = inject(I18nService);
  change(lang: 'es' | 'en') { this.i18n.setLang(lang); }
}
