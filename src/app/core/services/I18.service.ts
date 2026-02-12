import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

const LANG_STORE_KEY = 'lang' as const;
type Lang = 'es' | 'en';

// Utilidad para detectar si estamos en navegador
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly current$ = new BehaviorSubject<Lang>(this.init());

  constructor(private translate: TranslateService) {
    const def = this.translate.getDefaultLang() ?? 'es';
    this.translate.setDefaultLang(def);
    this.translate.use(this.current$.value);
    if (isBrowser()) {
      document.documentElement.lang = this.current$.value;
    }
  }

  // Idioma actual
  get current(): Lang {
    return (this.translate.currentLang ?? this.current$.value) as Lang;
  }

  // Observable de cambios (para invalidar caches por idioma)
  valueChanges() {
    return this.current$.asObservable();
  }

  // Cambiar idioma y sincronizar
  setLang(lang: Lang) {
    if (this.current$.value === lang) return;
    if (isBrowser()) localStorage.setItem(LANG_STORE_KEY, lang);
    this.current$.next(lang);
    this.translate.use(lang);
    if (isBrowser()) {
      document.documentElement.lang = lang;
    }
  }

  // Inicialización (evita localStorage si no es navegador)
  init(): Lang {
    if (!isBrowser()) return 'es';
    const stored = localStorage.getItem(LANG_STORE_KEY) as Lang | null;
    if (stored === 'es' || stored === 'en') return stored;
    const base = (navigator.language || 'es').split('-')[0].toLowerCase();
    return (base === 'en' || base === 'es') ? (base as Lang) : 'es';
  }
}
