import { Routes } from "@angular/router";
import { AdminLayout } from "./pages/AdminLayout/AdminLayout";

export const adminMenuRoutes: Routes = [
  {
    path: 'users',
    title: 'Gestión de Usuarios',
    data: { icon: 'fa-solid fa-user' },
    loadComponent: () => import('./pages/Users/Users')
  },
  {
    path: 'rutas',
    title: 'Gestión de Accesos',
    data: { icon: 'fa-solid fa-key' },
    loadComponent: () => import('./pages/AccessManager/AccessManager')
  },
  {
    title: 'PARAMETROS',
    data: { icon: 'fa-solid fa-sliders' },
    children: [
      {
        path: 'rutas-p',
        title: 'Rutas',
        data: { icon: 'fa-solid fa-route' },
        loadComponent: () => import('./pages/Rutas/Rutas')
      },
      {
        path: 'usuarios-p',
        title: 'Usuarios',
        data: { icon: 'fa-solid fa-user' },
        loadComponent: () => import('./pages/Users/Users')
      },
    ]
  },
];

export const AdminRoutes: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      ...adminMenuRoutes
        .filter(r => r.path),
      ...(
        adminMenuRoutes.find(r => r.title === 'PARAMETROS')?.children || []
      ),
      {
        path: '',
        redirectTo: '', // O a donde tú quieras
        pathMatch: 'full'
      }
    ]
  }
];

export default AdminRoutes;
