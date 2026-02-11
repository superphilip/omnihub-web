import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { I18nService } from '@core/services/I18.service';


// No uses inject() fuera de esta función
export const LanguageInterceptor: HttpInterceptorFn = (req, next) => {
  const i18n = inject(I18nService);
  const lang = i18n.current || 'es';
  return next(req.clone({ setHeaders: { 'Accept-Language': lang } }));
};
