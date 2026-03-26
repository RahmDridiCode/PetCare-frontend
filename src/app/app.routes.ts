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
    path: 'veterinarians',
    loadComponent: () =>
      import('./features/appointments/components/veterinarian-list/veterinarian-list.component').then(
        (m) => m.VeterinarianListComponent
      ),
  },
  {
    path: 'appointments/book',
    loadComponent: () =>
      import('./features/appointments/components/book-appointment/book-appointment.component').then(
        (m) => m.BookAppointmentComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'appointments/my',
    loadComponent: () =>
      import('./features/appointments/components/appointment-dashboard/appointment-dashboard.component').then(
        (m) => m.AppointmentDashboardComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'veterinarian/appointments',
    loadComponent: () =>
      import('./features/appointments/components/veterinarian-appointments/veterinarian-appointments.component').then(
        (m) => m.VeterinarianAppointmentsComponent
      ),
    canActivate: [authGuard],
  },
  {
    path: 'messages',
    loadComponent: () => import('./features/messages/message-list/message-list.component').then(m => m.MessageListComponent),
    canActivate: [authGuard],
  },
  {
    path: 'messages/:userId',
    loadComponent: () => import('./features/messages/chat/chat.component').then(m => m.ChatComponent),
    canActivate: [authGuard],
  },
  {
    path: 'post/:id',
    loadComponent: () => import('./features/publications/components/post-detail/post-detail.component').then(m => m.PostDetailComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];

