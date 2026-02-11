import { Injectable } from '@angular/core';
import { TranslocoLoader } from '@ngneat/transloco';

@Injectable({ providedIn: 'root' })
export class PublicTranslocoLoader implements TranslocoLoader {
  getTranslation(lang: string) {
    const base = (import.meta as any)?.env?.BASE_URL ?? '/';
    return fetch(`${base}i18n/${lang}.json`).then(r => r.json()); // Promise OK
  }
}
