import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { I18nService } from '@core/services/I18.service';

bootstrapApplication(App, appConfig)
  .then(ref => ref.injector.get(I18nService).init())
  .catch(err => console.error(err));
