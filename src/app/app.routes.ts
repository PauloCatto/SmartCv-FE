import { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then(r => r.AUTH_ROUTES),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('@layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
    ],
  },
  {
    path: 'resume',
    canActivate: [authGuard],
    loadChildren: () => import('./features/resume/resume.routes').then(r => r.RESUME_ROUTES),
  },
  {
    path: 'ai',
    canActivate: [authGuard],
    loadComponent: () => import('@layout/layout.component').then(m => m.LayoutComponent),
    loadChildren: () => import('./features/ai/ai.routes').then(r => r.AI_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
