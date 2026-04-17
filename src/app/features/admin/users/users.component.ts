import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div>
        <h2>Gestion des Utilisateurs</h2>
        <p class="subtitle">Gérez les comptes utilisateurs de la plateforme.</p>
      </div>
      <div class="header-stats">
        <div class="stat-chip">
          <span class="material-icons">group</span>
          {{ filteredUsers.length }} utilisateurs
        </div>
      </div>
    </div>

    <div *ngIf="!isAdmin" class="access-denied">
      <span class="material-icons">lock</span> Accès refusé
    </div>

    <div *ngIf="isAdmin">
      <!-- Search -->
      <div class="search-bar">
        <span class="material-icons">search</span>
        <input type="text" placeholder="Rechercher un utilisateur..." [(ngModel)]="searchTerm" (input)="filter()" />
      </div>

      <!-- Table -->
      <div class="table-wrapper">
        <table class="user-table">
          <thead>
            <tr>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of filteredUsers" class="user-row">
              <td>
                <div class="user-cell">
                  <img [src]="u.image || 'assets/images/avatar.jpg'" alt="" class="user-avatar" />
                  <span class="user-name">{{ u.fname }} {{ u.lname }}</span>
                </div>
              </td>
              <td class="email-cell">{{ u.email }}</td>
              <td>
                <span class="role-badge" [class]="u.role || 'user'">{{ u.role || 'user' }}</span>
              </td>
              <td>
                <div class="action-btns">
                  <button class="icon-btn edit" title="Modifier" (click)="update(u)">
                    <span class="material-icons">edit</span>
                  </button>
                  <button class="icon-btn delete" title="Supprimer" (click)="remove(u._id)">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="filteredUsers.length === 0" class="empty-state">
        <span class="material-icons">person_search</span>
        <p>Aucun utilisateur trouvé</p>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

    .page-header {
      display: flex; justify-content: space-between; align-items: flex-start;
      margin-bottom: 24px;
    }
    .page-header h2 { margin: 0; font-size: 24px; font-weight: 700; color: #1e1e2e; }
    .subtitle { color: #6b7280; margin-top: 4px; font-size: 14px; }
    .stat-chip {
      display: flex; align-items: center; gap: 6px;
      background: #e0e7ff; color: #4338ca; padding: 8px 16px;
      border-radius: 12px; font-weight: 600; font-size: 14px;
    }

    .access-denied {
      display: flex; align-items: center; gap: 8px;
      color: #ef4444; font-weight: 600; padding: 24px;
      background: #fef2f2; border-radius: 12px;
    }

    .search-bar {
      display: flex; align-items: center; gap: 10px;
      background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
      padding: 10px 16px; margin-bottom: 20px;
      transition: box-shadow 0.2s;
    }
    .search-bar:focus-within { box-shadow: 0 0 0 3px rgba(108,99,255,0.15); border-color: #6c63ff; }
    .search-bar .material-icons { color: #9ca3af; }
    .search-bar input {
      border: none; outline: none; flex: 1; font-size: 14px;
      font-family: inherit; background: transparent;
    }

    .table-wrapper {
      background: #fff; border-radius: 16px; overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
    }
    .user-table {
      width: 100%; border-collapse: collapse;
    }
    .user-table thead { background: #f8f9fc; }
    .user-table th {
      text-align: left; padding: 14px 20px;
      font-size: 12px; font-weight: 600; color: #6b7280;
      text-transform: uppercase; letter-spacing: 0.5px;
    }
    .user-table td { padding: 14px 20px; border-top: 1px solid #f0f0f5; }

    .user-row { transition: background 0.15s; }
    .user-row:hover { background: #f8f9fc; }

    .user-cell { display: flex; align-items: center; gap: 12px; }
    .user-avatar {
      width: 38px; height: 38px; border-radius: 10px;
      object-fit: cover; border: 2px solid #e5e7eb;
    }
    .user-name { font-weight: 600; font-size: 14px; color: #1e1e2e; }
    .email-cell { color: #6b7280; font-size: 13px; }

    .role-badge {
      padding: 4px 12px; border-radius: 20px;
      font-size: 12px; font-weight: 600; text-transform: capitalize;
    }
    .role-badge.user { background: #e0e7ff; color: #4338ca; }
    .role-badge.admin { background: #fce7f3; color: #be185d; }
    .role-badge.veterinaire { background: #d1fae5; color: #059669; }

    .action-btns { display: flex; gap: 6px; }
    .icon-btn {
      width: 36px; height: 36px; border: none; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all 0.2s;
    }
    .icon-btn .material-icons { font-size: 18px; }
    .icon-btn.edit { background: #eff6ff; color: #3b82f6; }
    .icon-btn.edit:hover { background: #dbeafe; box-shadow: 0 2px 8px rgba(59,130,246,0.25); }
    .icon-btn.delete { background: #fef2f2; color: #ef4444; }
    .icon-btn.delete:hover { background: #fee2e2; box-shadow: 0 2px 8px rgba(239,68,68,0.25); }

    .empty-state {
      text-align: center; padding: 48px 20px; color: #6b7280;
    }
    .empty-state .material-icons { font-size: 48px; color: #a5b4fc; }
  `],
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  isAdmin = false;
  searchTerm = '';

  constructor(private admin: AdminService, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const u = (this.auth as any).currentUserSubject?.value;
    this.isAdmin = !!u && u.role === 'admin';
    if (this.isAdmin) this.load();
  }

  load(): void {
    this.admin.getAllUsers().subscribe((res: any) => {
      this.users = (res || []).filter((x: any) => x.isApproved === true);
      this.filter();
    });
  }

  filter(): void {
    const s = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(u =>
      `${u.fname} ${u.lname} ${u.email}`.toLowerCase().includes(s)
    );
  }

  remove(id: string): void {
    if (confirm('Supprimer cet utilisateur ?'))
      this.admin.deleteUser(id).subscribe(() => this.load());
  }

  update(u: any): void {
    this.router.navigate(['/admin/users', u._id, 'edit']);
  }
}
