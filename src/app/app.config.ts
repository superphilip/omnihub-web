import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { TRANSLOCO_CONFIG, TRANSLOCO_LOADER, translocoConfig } from '@ngneat/transloco';
import { PublicTranslocoLoader } from './i18n/PublicTranslocoLoader';

import { routes } from './app.routes';
import { AuthInterceptor } from '@core/interceptor/auth.interceptor';
import { LanguageInterceptor } from '@core/interceptor/language.interceptor';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, gcTime: 5 * 60_000, retry: 1, refetchOnWindowFocus: false },
    mutations: { retry: 0 },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),

    // Config Transloco con TOKENS
    {
      provide: TRANSLOCO_CONFIG,
      useValue: translocoConfig({
        availableLangs: ['es', 'en'],
        defaultLang: 'es',
        reRenderOnLangChange: true,
        prodMode: false,
      }),
    },
    { provide: TRANSLOCO_LOADER, useClass: PublicTranslocoLoader },

    // HTTP + interceptores después
    provideHttpClient(withFetch(), withInterceptors([LanguageInterceptor, AuthInterceptor])),

    provideTanStackQuery(queryClient),
  ],
};
