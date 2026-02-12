import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';

// NGX-Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';

// Resto
import { routes } from './app.routes';
import { AuthInterceptor } from '@core/interceptor/auth.interceptor';
import { LanguageInterceptor } from '@core/interceptor/language.interceptor';
import { PublicTranslateLoader } from './i18n/PublicTranslateLoader';

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

    importProvidersFrom(
      TranslateModule.forRoot({
        fallbackLang: 'es',
        loader: { provide: TranslateLoader, useClass: PublicTranslateLoader },
      })
    ),

    provideHttpClient(
      withFetch(),
      withInterceptors([AuthInterceptor, LanguageInterceptor])
    ),

    provideTanStackQuery(queryClient),
  ],
};
