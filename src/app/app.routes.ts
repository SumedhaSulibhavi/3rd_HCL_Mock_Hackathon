import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/landing/landing.component').then((m) => m.LandingComponent),
    title: 'NexusDesk — IT Service Desk',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then((m) => m.LoginComponent),
    title: 'Sign in — NexusDesk',
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/register/register.component').then((m) => m.RegisterComponent),
    title: 'Register — NexusDesk',
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
        title: 'Workspace — NexusDesk',
      },
      {
        path: 'tickets/new',
        canActivate: [roleGuard('Employee')],
        loadComponent: () =>
          import('./components/ticket-create/ticket-create.component').then(
            (m) => m.TicketCreateComponent,
          ),
        title: 'Raise ticket — NexusDesk',
      },
      {
        path: 'tickets/:id',
        loadComponent: () =>
          import('./components/ticket-detail/ticket-detail.component').then(
            (m) => m.TicketDetailComponent,
          ),
        title: 'Ticket detail — NexusDesk',
      },
      {
        path: 'engineer',
        canActivate: [roleGuard('SupportEngineer')],
        loadComponent: () =>
          import('./components/engineer-queue/engineer-queue.component').then(
            (m) => m.EngineerQueueComponent,
          ),
        title: 'Engineer queue — NexusDesk',
      },
      {
        path: 'analytics',
        canActivate: [roleGuard('Manager')],
        loadComponent: () =>
          import('./components/manager-dashboard/manager-dashboard.component').then(
            (m) => m.ManagerDashboardComponent,
          ),
        title: 'Analytics — NexusDesk',
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
