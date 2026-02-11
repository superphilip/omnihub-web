import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { I18nService } from '@core/services/I18.service';
import { TranslateService } from '@ngx-translate/core';

bootstrapApplication(App, appConfig)
  .then(ref => {
    const i18n = ref.injector.get(I18nService);
    i18n.init();
    const translate = ref.injector.get(TranslateService);
    console.log('Lang activo:', translate.currentLang);
  })
  .catch(err => console.error(err));
