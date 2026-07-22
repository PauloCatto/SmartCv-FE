import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { canDeactivateGuard } from './core/guards/can-deactivate.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home',
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/pages/login/login').then(m => m.Login),
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/pages/register/register').then(m => m.Register),
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/pages/forgot-password/forgot-password').then(m => m.ForgotPassword),
      },
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/pages/reset-password/reset-password').then(m => m.ResetPassword),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
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
    children: [
      {
        path: 'new',
        loadComponent: () => import('./features/resume/pages/builder/builder.component').then(m => m.BuilderComponent),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: ':id/edit',
        loadComponent: () => import('./features/resume/pages/builder/builder.component').then(m => m.BuilderComponent),
        canDeactivate: [canDeactivateGuard],
      },
    ],
  },
  {
    path: 'ai',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'cover-letter',
        loadComponent: () => import('./features/ai/pages/cover-letter/cover-letter.component').then(m => m.CoverLetterPageComponent),
        canDeactivate: [canDeactivateGuard],
      },
      {
        path: 'roast',
        loadComponent: () => import('./features/ai/pages/roast-resume/roast-resume.component').then(m => m.RoastResumePageComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
