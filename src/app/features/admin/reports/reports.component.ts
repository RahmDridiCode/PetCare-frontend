import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, RouterModule],
  template: `
    <div class="header-row">
      <h2>Reported Posts</h2>
      <p class="subtitle">Moderate posts flagged by users.</p>
    </div>

    <div *ngIf="!isAdmin" class="access">Access denied</div>

    <div *ngIf="isAdmin" class="reports-grid">
      <mat-card *ngFor="let p of posts" class="report-card">
        <mat-card-header>
          <mat-card-title>Author: {{ p.user?.fname }} {{ p.user?.lname }}</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="desc">{{ p.description }}</div>
          <div class="reports"><strong>Reports:</strong> {{ p.reports?.length || 0 }}</div>
          <div *ngIf="p.reports" class="reasons">
            <div *ngFor="let r of p.reports">• {{ r.reason }} (par {{ r.userId?.fname ? (r.userId.fname + ' ' + r.userId.lname) : r.userId }})</div>
          </div>
        </mat-card-content>
        <mat-card-actions>
          <button mat-button (click)="view(p._id)">View</button>
          <button mat-raised-button color="warn" (click)="del(p._id)">Delete Post</button>
          <button mat-button (click)="clear(p._id)">Ignore Reports</button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [
    `
    .header-row{margin-bottom:12px}
    .subtitle{color:rgba(0,0,0,0.6)}
    .reports-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}
    .report-card{padding:8px}
    .desc{margin-top:6px}
    .reasons{margin-top:8px;color:#555}
    .access{color:crimson}
    `,
  ],
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
    this.admin.deletePost(id).subscribe(() => this.load());
  }

  clear(id: string): void {
    this.admin.clearReports(id).subscribe(() => this.load());
  }
}
