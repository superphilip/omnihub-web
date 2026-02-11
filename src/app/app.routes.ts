import { Routes } from '@angular/router';
import { Root } from '@components/Root/Root';

import { AuthGuard } from '@core/guards/auth-guard';
import { PublicGuard } from '@core/guards/public-guard';
import { RootGuard } from '@core/guards/root-guard';
import { setupGuard } from '@core/guards/ssetup-guard';


export const routes: Routes = [
  {
    path: '',
    canActivate: [RootGuard],
    component: Root
  },
  {
    path: 'setup',
    canActivate: [setupGuard],
    loadComponent: () => import('./features/setup-initialize/pages/setup-initialize/setup-initialize')
  },
  {
    path: 'auth',
    canActivate: [PublicGuard],
    loadChildren: () =>
      import('./features/auth/Auth.routes')
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    loadChildren: () => import('./features/admin/Admin.routes')
  }
];
