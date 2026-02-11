import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { provideTanStackQuery, QueryClient } from '@tanstack/angular-query-experimental';
import { AuthInterceptor } from '@core/interceptor/auth.interceptor';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // evita flicker y revalidaciones muy agresivas
      staleTime: 30_000,    // 30s
      gcTime: 5 * 60_000,   // 5 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([AuthInterceptor])
    ),

    provideTanStackQuery(queryClient)
  ]
};
