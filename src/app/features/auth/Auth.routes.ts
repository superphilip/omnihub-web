import { Routes } from '@angular/router';

export const AuthRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/Login/Login') // Ruta relativa a este archivo
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

export default AuthRoutes;
