import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-header">
          <div class="logo">
            <span class="logo-icon">🐾</span>
            <span class="logo-text" *ngIf="!sidebarCollapsed">PetCare Admin</span>
          </div>
          <button class="toggle-btn" (click)="sidebarCollapsed = !sidebarCollapsed">
            <span class="material-icons">{{ sidebarCollapsed ? 'chevron_right' : 'chevron_left' }}</span>
          </button>
        </div>

        <nav class="sidebar-nav">
          <a routerLink="/admin/veterinarians" routerLinkActive="active" class="nav-item">
            <span class="material-icons">local_hospital</span>
            <span class="nav-label" *ngIf="!sidebarCollapsed">Vétérinaires</span>
          </a>
          <a routerLink="/admin/users" routerLinkActive="active" class="nav-item">
            <span class="material-icons">group</span>
            <span class="nav-label" *ngIf="!sidebarCollapsed">Utilisateurs</span>
          </a>
          <a routerLink="/admin/reports" routerLinkActive="active" class="nav-item">
            <span class="material-icons">report_problem</span>
            <span class="nav-label" *ngIf="!sidebarCollapsed">Signalements</span>
          </a>
        </nav>

        <div class="sidebar-footer" *ngIf="!sidebarCollapsed">
          <a routerLink="/" class="nav-item back-link">
            <span class="material-icons">arrow_back</span>
            <span class="nav-label">Retour au site</span>
          </a>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="main-content">
        <header class="topbar">
          <h1 class="page-title">Tableau de bord</h1>
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
  styles: [`
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: #f0f2f8;
      font-family: 'Poppins', sans-serif;
    }

    /* ── Sidebar ── */
    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #6c63ff 0%, #4b44cc 100%);
      color: #fff;
      display: flex;
      flex-direction: column;
      transition: width 0.3s cubic-bezier(.4,0,.2,1);
      position: sticky;
      top: 0;
      height: 100vh;
      z-index: 100;
      box-shadow: 4px 0 24px rgba(108,99,255,0.18);
    }
    .sidebar.collapsed { width: 72px; }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 16px 12px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-icon { font-size: 28px; }
    .logo-text {
      font-size: 17px;
      font-weight: 700;
      letter-spacing: 0.3px;
      white-space: nowrap;
    }
    .toggle-btn {
      background: rgba(255,255,255,0.15);
      border: none;
      color: #fff;
      border-radius: 8px;
      width: 32px;
      height: 32px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .toggle-btn:hover { background: rgba(255,255,255,0.28); }

    .sidebar-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 16px 12px;
      gap: 4px;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      border-radius: 12px;
      color: rgba(255,255,255,0.78);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
      cursor: pointer;
    }
    .nav-item:hover {
      background: rgba(255,255,255,0.15);
      color: #fff;
    }
    .nav-item.active {
      background: rgba(255,255,255,0.22);
      color: #fff;
      font-weight: 600;
      box-shadow: 0 2px 12px rgba(0,0,0,0.12);
    }
    .nav-item .material-icons { font-size: 22px; }

    .sidebar-footer {
      padding: 12px;
      border-top: 1px solid rgba(255,255,255,0.15);
    }
    .back-link { font-size: 13px; opacity: 0.8; }

    /* ── Main ── */
    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 32px;
      background: #fff;
      border-bottom: 1px solid #e5e7eb;
      position: sticky;
      top: 0;
      z-index: 50;
      box-shadow: 0 1px 8px rgba(0,0,0,0.04);
    }
    .page-title {
      font-size: 22px;
      font-weight: 700;
      color: #1e1e2e;
      margin: 0;
    }
    .admin-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #6c63ff, #4b44cc);
      color: #fff;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }
    .admin-badge .material-icons { font-size: 16px; }

    .content-area {
      flex: 1;
      padding: 28px 32px;
      overflow-y: auto;
    }
  `],
})
export class AdminDashboardComponent {
  sidebarCollapsed = false;
}
