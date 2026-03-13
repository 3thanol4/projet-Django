import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.Login) },
    { path: 'register', loadComponent: () => import('./auth/register/register.component').then(m => m.Register) },
    { path: 'profile', loadComponent: () => import('./auth/profile/profile.component').then(m => m.ProfileComponent), canActivate: [authGuard] },
    { path: 'dashboard', loadComponent: () => import('./projects/project-list/project-list.component').then(m => m.ProjectListComponent), canActivate: [authGuard] },
    { path: 'projects/:id', loadComponent: () => import('./projects/project-detail/project-detail.component').then(m => m.ProjectDetailComponent), canActivate: [authGuard] },
    { path: 'stats', loadComponent: () => import('./stats/stats/stats.component').then(m => m.StatsComponent), canActivate: [authGuard] },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
];
