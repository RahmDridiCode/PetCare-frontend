import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <h2>Publications Signalées</h2>
        <p class="subtitle">Modérez les publications signalées par les utilisateurs.</p>
      </div>
      <div class="stat-badge danger">
        <span class="material-icons">flag</span>
        <span>{{ posts.length }} signalements</span>
      </div>
    </div>

    <div *ngIf="!isAdmin" class="access-denied">
      <span class="material-icons">lock</span> Accès refusé
    </div>

    <div *ngIf="isAdmin && posts.length === 0" class="empty-state">
      <span class="material-icons">verified</span>
      <p>Aucune publication signalée</p>
    </div>

    <div *ngIf="isAdmin" class="grid">
      <div *ngFor="let p of posts" class="card">
        <div class="card-header">
          <div class="author-info">
            <div class="author-avatar">
              <span class="material-icons">person</span>
            </div>
            <div>
              <h4>{{ p.user?.fname }} {{ p.user?.lname }}</h4>
              <span class="date">{{ p.createdAt | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
          </div>
          <span class="report-count">
            <span class="material-icons">report</span>
            {{ p.reports?.length || 0 }}
          </span>
        </div>

        <div class="card-body">
          <p class="description">{{ p.description }}</p>

          <div class="reasons-section" *ngIf="p.reports?.length">
            <h5>Raisons des signalements</h5>
            <div *ngFor="let r of p.reports" class="reason-item">
              <span class="material-icons">subdirectory_arrow_right</span>
              <div>
                <span class="reason-text">{{ r.reason }}</span>
                <span class="reason-by">par {{ r.userId?.fname ? (r.userId.fname + ' ' + r.userId.lname) : 'Anonyme' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <button class="btn btn-view" (click)="view(p._id)">
            <span class="material-icons">visibility</span> Voir
          </button>
          <button class="btn btn-ignore" (click)="clear(p._id)">
            <span class="material-icons">do_not_disturb</span> Ignorer
          </button>
          <button class="btn btn-delete" (click)="del(p._id)">
            <span class="material-icons">delete</span> Supprimer
          </button>
        </div>
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
    .stat-badge.danger {
      display: flex; align-items: center; gap: 6px;
      background: #fef2f2; color: #dc2626; padding: 8px 16px;
      border-radius: 12px; font-weight: 600; font-size: 14px;
    }

    .access-denied {
      display: flex; align-items: center; gap: 8px;
      color: #ef4444; font-weight: 600; padding: 24px;
      background: #fef2f2; border-radius: 12px;
    }
    .empty-state {
      text-align: center; padding: 60px 20px; color: #6b7280;
    }
    .empty-state .material-icons { font-size: 56px; color: #86efac; }
    .empty-state p { font-size: 16px; margin-top: 8px; }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 20px;
    }
    .card {
      background: #fff; border-radius: 16px; overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      border-left: 4px solid #ef4444;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 28px rgba(239,68,68,0.12);
    }

    .card-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 16px 20px; background: #fafbfd;
    }
    .author-info { display: flex; align-items: center; gap: 12px; }
    .author-avatar {
      width: 40px; height: 40px; border-radius: 10px;
      background: linear-gradient(135deg, #f87171, #ef4444);
      display: flex; align-items: center; justify-content: center;
      color: #fff;
    }
    .author-avatar .material-icons { font-size: 22px; }
    .author-info h4 { margin: 0; font-size: 14px; font-weight: 600; }
    .date { font-size: 12px; color: #9ca3af; }
    .report-count {
      display: flex; align-items: center; gap: 4px;
      background: #fef2f2; color: #dc2626; padding: 4px 10px;
      border-radius: 8px; font-weight: 700; font-size: 14px;
    }
    .report-count .material-icons { font-size: 16px; }

    .card-body { padding: 16px 20px; }
    .description {
      font-size: 14px; color: #374151; line-height: 1.5;
      margin: 0 0 12px;
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .reasons-section h5 {
      font-size: 12px; font-weight: 600; color: #6b7280;
      text-transform: uppercase; letter-spacing: 0.5px;
      margin: 0 0 8px;
    }
    .reason-item {
      display: flex; align-items: flex-start; gap: 6px;
      padding: 6px 0; font-size: 13px;
    }
    .reason-item .material-icons { font-size: 16px; color: #d1d5db; margin-top: 2px; }
    .reason-text { color: #374151; }
    .reason-by { color: #9ca3af; font-size: 12px; margin-left: 4px; }

    .card-actions {
      display: flex; gap: 0; border-top: 1px solid #f0f0f5;
    }
    .btn {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 12px 0; border: none; background: none;
      font-size: 13px; font-weight: 600; cursor: pointer;
      transition: background 0.2s;
    }
    .btn .material-icons { font-size: 18px; }
    .btn-view { color: #6c63ff; }
    .btn-view:hover { background: #f0efff; }
    .btn-ignore { color: #6b7280; }
    .btn-ignore:hover { background: #f5f5f5; }
    .btn-delete { color: #ef4444; }
    .btn-delete:hover { background: #fef2f2; }
  `],
})
export class ReportsComponent implements OnInit {
  posts: any[] = [];
  isAdmin = false;

  constructor(private admin: AdminService, private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    const u = (this.auth as any).currentUserSubject?.value;
    this.isAdmin = !!u && u.role === 'admin';
    if (this.isAdmin) this.load();
  }

  load(): void {
    this.admin.getReportedPosts().subscribe((res: any) => (this.posts = res));
  }

  view(id: string): void {
    this.router.navigate(['/post', id]);
  }

  del(id: string): void {
    if (confirm('Supprimer cette publication ?'))
      this.admin.deletePost(id).subscribe(() => this.load());
  }

  clear(id: string): void {
    this.admin.clearReports(id).subscribe(() => this.load());
  }
}
