import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

// Diccionario de traducciones: claves a string o a sub-árbol
export type TranslationDict = { [key: string]: string | TranslationDict };

@Injectable()
export class PublicTranslateLoader implements TranslateLoader {
  // Firma exigida por la librería (puede declarar 'any'); la implementación devuelve TranslationDict
  getTranslation(lang: string): Observable<any>;
  getTranslation(lang: string): Observable<TranslationDict> {
    // Ruta relativa: evita import.meta.env y cualquier 'any'
    return this.http.get<TranslationDict>(`/i18n/${lang}.json`);
  }

  constructor(private http: HttpClient) {}
}
