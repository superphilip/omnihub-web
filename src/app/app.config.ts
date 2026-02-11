import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { provideTransloco, translocoConfig } from '@ngneat/transloco';


import { routes } from './app.routes';
import { AuthInterceptor } from '@core/interceptor/auth.interceptor';
import { LanguageInterceptor } from '@core/interceptor/language.interceptor';
import { PublicTranslocoLoader } from './i18n/PublicTanslocoloader';

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

    // Transloco debe ir ANTES que HTTP/interceptores y debe ser la ÚNICA config de i18n
    provideTransloco({
      config: translocoConfig({
        availableLangs: ['es', 'en'],
        defaultLang: 'es',
        reRenderOnLangChange: true,
        prodMode: false,
      }),
      loader: PublicTranslocoLoader, // clase Injectable
    }),

    provideHttpClient(withFetch(), withInterceptors([LanguageInterceptor, AuthInterceptor])),
    provideTanStackQuery(queryClient),
  ],
};
