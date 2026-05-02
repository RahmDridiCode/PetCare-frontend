import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <span class="logo-icon">🐾</span>
            <span class="logo-text">PetCare Admin</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/admin" routerLinkActive="active" class="nav-item" [routerLinkActiveOptions]="{ exact: true }">
            <span class="material-icons">dashboard</span>
            <span class="nav-label">Tableau de bord</span>
          </a>
          <a routerLink="/admin/veterinarians" routerLinkActive="active" class="nav-item">
            <span class="material-icons">local_hospital</span>
            <span class="nav-label">Vétérinaires</span>
          </a>
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
            <span class="material-icons">group</span>
            <span class="nav-label">Utilisateurs</span>
          </a>
          <a routerLink="/admin/reports" routerLinkActive="active" class="nav-item">
            <span class="material-icons">report_problem</span>
            <span class="nav-label">Signalements</span>
          </a>
        </nav>

        <div class="sidebar-footer">
          <a routerLink="/" class="nav-item back-link">
            <span class="material-icons">arrow_back</span>
            <span class="nav-label">Retour au site</span>
          </a>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="topbar">
          <h1 class="page-title">Administration</h1>
          <div class="topbar-right">
            <span class="admin-badge">
              <span class="material-icons">verified_user</span>
              Admin
            </span>
          </div>
        </header>

        <div class="content-area">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [
    `@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

    .admin-layout { display:flex; min-height:100vh; background:#f0f2f8; font-family:'Poppins',sans-serif }

    .sidebar { width:260px; background:linear-gradient(180deg,#6c63ff 0%,#4b44cc 100%); color:#fff; display:flex; flex-direction:column; position:sticky; top:0; height:100vh; z-index:100; box-shadow:4px 0 24px rgba(108,99,255,0.18) }
    .sidebar-header { padding:20px 16px 12px }
    .logo { display:flex; align-items:center; gap:10px }
    .logo-icon { font-size:28px }
    .logo-text { font-size:17px; font-weight:700 }

    .sidebar-nav { flex:1; display:flex; flex-direction:column; padding:16px 12px; gap:8px }
    .nav-item { display:flex; align-items:center; gap:12px; padding:12px 14px; border-radius:12px; color:rgba(255,255,255,0.9); text-decoration:none; font-weight:600 }
    .nav-item .material-icons { font-size:20px }
    .nav-item.active, .nav-item:hover { background:rgba(255,255,255,0.12); color:#fff }

    .sidebar-footer { padding:12px; border-top:1px solid rgba(255,255,255,0.12) }

    .main-content { flex:1; display:flex; flex-direction:column }
    .topbar { display:flex; align-items:center; justify-content:space-between; padding:18px 24px; background:#fff; border-bottom:1px solid #e5e7eb; position:sticky; top:0; z-index:50 }
    .page-title { margin:0; font-weight:700 }
    .admin-badge { display:flex; align-items:center; gap:6px; background:linear-gradient(135deg,#6c63ff,#4b44cc); color:#fff; padding:6px 12px; border-radius:16px; font-weight:600 }
    .content-area { padding:28px 32px; overflow:auto }
  `]
})
export class AdminLayoutComponent {}
