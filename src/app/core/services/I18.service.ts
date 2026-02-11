import { Injectable } from '@angular/core';
import { TranslocoService } from '@ngneat/transloco';

const LANG_STORE_KEY = 'lang' as const;
type Lang = 'es' | 'en';

@Injectable({ providedIn: 'root' })
export class I18nService {
  constructor(private transloco: TranslocoService) {}

  get current(): string { return this.transloco.getActiveLang(); }

  init() {
    const stored = (localStorage.getItem(LANG_STORE_KEY) as Lang | null) ?? 'es';
    this.setLang(stored);
  }

  setLang(lang: Lang) {
    localStorage.setItem(LANG_STORE_KEY, lang);
    this.transloco.setActiveLang(lang);
  }
}
