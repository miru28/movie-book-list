import { Routes } from '@angular/router';
import { authRequiredGuard } from '../../core/auth/auth.guard';

export const LIBRARY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./list/list.component').then((c) => c.ListComponent),
    canActivate: [authRequiredGuard],
  },
];
