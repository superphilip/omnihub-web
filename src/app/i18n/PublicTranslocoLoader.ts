import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslocoLoader } from '@ngneat/transloco';

@Injectable({ providedIn: 'root' })
export class PublicTranslocoLoader implements TranslocoLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string) {
    const base = (import.meta as any)?.env?.BASE_URL ?? '/';
    // Usa HttpClient para integrarse con Angular (zona, estabilización, interceptores)
    return this.http.get<Record<string, any>>(`${base}i18n/${lang}.json`);
  }
}
