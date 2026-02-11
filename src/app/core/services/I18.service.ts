import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

const LANG_STORE_KEY = 'lang' as const;
type Lang = 'es' | 'en';

@Injectable({ providedIn: 'root' })
export class I18nService {
  constructor(private translate: TranslateService) {
    const def = this.translate.getDefaultLang() ?? 'es';
    this.translate.setDefaultLang(def);
  }

  get current(): string {
    return this.translate.currentLang ?? this.translate.getDefaultLang() ?? 'es';
  }

  init() {
    const stored = (localStorage.getItem(LANG_STORE_KEY) as Lang | null) ?? 'es';
    this.setLang(stored);
  }

  setLang(lang: Lang) {
    localStorage.setItem(LANG_STORE_KEY, lang);
    this.translate.use(lang);
  }
}
