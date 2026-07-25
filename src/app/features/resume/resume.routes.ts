import { Routes } from '@angular/router';
import { canDeactivateGuard } from '@core/guards/can-deactivate.guard';

export const RESUME_ROUTES: Routes = [
  {
    path: 'new',
    loadComponent: () => import('./pages/builder/builder.component').then(m => m.BuilderComponent),
    canDeactivate: [canDeactivateGuard],
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./pages/builder/builder.component').then(m => m.BuilderComponent),
    canDeactivate: [canDeactivateGuard],
  },
];
