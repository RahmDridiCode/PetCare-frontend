import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  template: `
    <div class="header-row">
      <h2>Users</h2>
      <p class="subtitle">Manage registered users and remove problematic accounts.</p>
    </div>

    <div *ngIf="!isAdmin" class="access">Access denied</div>

    <div *ngIf="isAdmin" class="users-grid">
      <mat-card *ngFor="let u of users" class="user-card">
        <mat-card-header>
          <img mat-card-avatar [src]="u.image || 'assets/images/avatar.jpg'" alt="avatar" class="user-avatar" />
          <mat-card-title>{{ u.fname }} {{ u.lname }}</mat-card-title>
          <mat-card-subtitle>{{ u.email }} — {{ u.role || 'user' }}</mat-card-subtitle>
        </mat-card-header>
        <mat-card-actions>
          <button mat-button color="primary" (click)="update(u)">Update</button>
          <button mat-button color="warn" (click)="remove(u._id)">Delete</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `
    .header-row{margin-bottom:12px}
    .subtitle{color:rgba(0,0,0,0.6)}
    .users-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px}
    .user-card{padding:8px}
    .avatar{background:#e6f7ff;border-radius:6px;display:flex;align-items:center;justify-content:center}
    .access{color:crimson}
    `,
  ],
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  isAdmin = false;

  constructor(private admin: AdminService, private auth: AuthService) {}

  ngOnInit(): void {
    const u = (this.auth as any).currentUserSubject?.value;
    this.isAdmin = !!u && u.role === 'admin';
    if (this.isAdmin) this.load();
  }

  load(): void {
    this.admin.getAllUsers().subscribe((res: any) => (this.users = (res || []).filter((x: any) => x.isApproved === true)));
  }

  remove(id: string): void {
    this.admin.deleteUser(id).subscribe(() => this.load());
  }

  update(u: any): void {
    // navigate to admin user edit page
    (window as any).location.href = `/admin/users/${u._id}/edit`;
  }
}
