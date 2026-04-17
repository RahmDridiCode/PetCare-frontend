import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule],
  template: `
    <mat-sidenav-container class="admin-container">
      <mat-sidenav mode="side" opened class="admin-sidenav">
        <div class="brand">
          <mat-icon>admin_panel_settings</mat-icon>
          <span>Admin Panel</span>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/admin/veterinarians"><mat-icon>medical_services</mat-icon><span>Vets</span></a>
          <a mat-list-item routerLink="/admin/users"><mat-icon>people</mat-icon><span>Users</span></a>
          <a mat-list-item routerLink="/admin/reports"><mat-icon>flag</mat-icon><span>Reports</span></a>
        </mat-nav-list>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar color="accent" class="admin-toolbar">
          <span>Administration</span>
        </mat-toolbar>
        <div class="admin-content">
          <router-outlet></router-outlet>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
    .admin-container { height: 100%; min-height: 600px; }
    .admin-sidenav { width: 220px; padding: 12px; }
    .brand { display:flex; align-items:center; gap:8px; padding:8px 4px; font-weight:600 }
    .admin-toolbar { position: sticky; top:0; z-index:2 }
    .admin-content { padding: 20px; background: #f5f7fb; min-height: calc(100vh - 64px) }
    a.mat-list-item { border-radius:6px }
    `,
  ],
})
export class AdminDashboardComponent {}
