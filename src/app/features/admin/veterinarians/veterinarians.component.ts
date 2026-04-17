import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-veterinarians',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule, MatGridListModule],
  template: `
    <div class="header-row">
      <h2>Veterinarian Requests</h2>
      <p class="subtitle">Review uploaded diplomas and approve or reject veterinarian accounts.</p>
    </div>

    <div *ngIf="!isAdmin" class="access">Access denied</div>

    <div *ngIf="isAdmin">
      <div class="grid">
        <mat-card *ngFor="let v of vets" class="vet-card">
          <mat-card-header>
            <div mat-card-avatar class="avatar"><mat-icon>person</mat-icon></div>
            <mat-card-title>{{ v.fname }} {{ v.lname }}</mat-card-title>
            <mat-card-subtitle>{{ v.email }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="info">Phone: {{ v.phone || '—' }}</div>
            <div class="info">Adresse: {{ v.adresse?.ville || '—' }}</div>
            <div class="diploma"><a [href]="v.diploma" target="_blank">View Diploma</a></div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-raised-button color="primary" (click)="approve(v._id)">Approve</button>
            <button mat-button color="warn" (click)="reject(v._id)">Reject</button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
    .header-row{display:flex;flex-direction:column;margin-bottom:12px}
    .subtitle{color:rgba(0,0,0,0.6);margin-top:4px}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
    .vet-card{padding:8px}
    .avatar{background:#e0e7ff;border-radius:6px;display:flex;align-items:center;justify-content:center}
    .info{font-size:13px;color:#444;margin-top:6px}
    .diploma{margin-top:8px}
    .access{color:crimson}
    `,
  ],
})
export class VeterinariansComponent implements OnInit {
  vets: any[] = [];
  isAdmin = false;

  constructor(private admin: AdminService, private auth: AuthService) {}

  ngOnInit(): void {
    const u = (this.auth as any).currentUserSubject?.value;
    this.isAdmin = !!u && u.role === 'admin';
    if (this.isAdmin) this.load();
  }

  load(): void {
    this.admin.getPendingVeterinarians().subscribe((res: any) => (this.vets = res));
  }

  approve(id: string): void {
    this.admin.approveVeterinarian(id).subscribe(() => this.load());
  }

  reject(id: string): void {
    this.admin.rejectVeterinarian(id).subscribe(() => this.load());
  }
}
