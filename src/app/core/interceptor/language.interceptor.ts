import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { I18nService } from '@core/services/I18.service';

export const LanguageInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/i18n/')) return next(req); // no tocar traducciones
  const i18n = inject(I18nService);
  const lang = i18n.current || 'es';
  return next(req.clone({ setHeaders: { 'Accept-Language': lang } }));
};
