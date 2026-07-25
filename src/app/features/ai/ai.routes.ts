import { Routes } from '@angular/router';
import { canDeactivateGuard } from '@core/guards/can-deactivate.guard';

export const AI_ROUTES: Routes = [
  {
    path: 'cover-letter',
    loadComponent: () => import('./pages/cover-letter/cover-letter.component').then(m => m.CoverLetterPageComponent),
    canDeactivate: [canDeactivateGuard],
  },
  {
    path: 'roast',
    loadComponent: () => import('./pages/roast-resume/roast-resume.component').then(m => m.RoastResumePageComponent),
  },
];
