import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/publications/components/post-list/post-list.component').then(
        (m) => m.PostListComponent
      ),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/components/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/components/signup/signup.component').then(
        (m) => m.SignupComponent
      ),
  },
  {
    path: 'signup/veterinaire',
    loadComponent: () =>
      import(
        './features/auth/components/signup-veterinaire/signup-veterinaire.component'
      ).then((m) => m.SignupVeterinaireComponent),
  },
  {
    path: 'profile',
    loadComponent: () =>
      import(
        './features/profile/components/view-profile/view-profile.component'
      ).then((m) => m.ViewProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile/edit',
    loadComponent: () =>
      import(
        './features/profile/components/edit-profile/edit-profile.component'
      ).then((m) => m.EditProfileComponent),
    canActivate: [authGuard],
  },
  {
    path: 'profile/:id',
    loadComponent: () =>
      import(
        './features/profile/components/view-profile/view-profile.component'
      ).then((m) => m.ViewProfileComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

