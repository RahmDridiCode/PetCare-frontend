import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-veterinarians',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div>
        <h2>Demandes Vétérinaires</h2>
        <p class="subtitle">Examinez les diplômes et approuvez ou refusez les comptes vétérinaires.</p>
      </div>
      <div class="stat-badge">
        <span class="material-icons">pending_actions</span>
        <span>{{ vets.length }} en attente</span>
      </div>
    </div>

    <div *ngIf="!isAdmin" class="access-denied">
      <span class="material-icons">lock</span>
      Accès refusé
    </div>

    <div *ngIf="isAdmin && vets.length === 0" class="empty-state">
      <span class="material-icons">check_circle</span>
      <p>Aucune demande en attente</p>
    </div>

    <div *ngIf="isAdmin" class="grid">
      <div *ngFor="let v of vets" class="card">
        <div class="card-top">
          <div class="avatar">
            <span class="material-icons">person</span>
          </div>
          <div class="card-info">
            <h3>{{ v?.fname }} {{ v?.lname }}</h3>
            <span class="email">{{ v?.email }}</span>
          </div>
          <span class="status-dot pending"></span>
        </div>
        <div class="card-body">
          <div class="detail"><span class="material-icons">phone</span> {{ v?.phone || '—' }}</div>
          <div class="detail">
            <span class="material-icons">location_on</span>
            <span *ngIf="v?.adresse">{{ v.adresse.street ? (v.adresse.street + ', ') : '' }}{{ v.adresse.ville || '' }}{{ v.adresse.region ? (' — ' + v.adresse.region) : '' }}</span>
            <span *ngIf="!v?.adresse">—</span>
          </div>
          <a [href]="v?.diploma" target="_blank" class="diploma-link">
            <span class="material-icons">description</span> Voir le diplôme
          </a>
        </div>
        <div class="card-actions">
          <button class="btn btn-approve" (click)="approve(v._id)">
            <span class="material-icons">check_circle</span> Approuver
          </button>
          <button class="btn btn-reject" (click)="reject(v._id)">
            <span class="material-icons">cancel</span> Refuser
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
    .stat-badge {
      display: flex; align-items: center; gap: 6px;
      background: #fff3e0; color: #e65100; padding: 8px 16px;
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
    .empty-state .material-icons { font-size: 56px; color: #a5b4fc; }
    .empty-state p { font-size: 16px; margin-top: 8px; }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
    }
    .card {
      background: #fff; border-radius: 16px; padding: 20px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .card:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 28px rgba(108,99,255,0.13);
    }

    .card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .avatar {
      width: 48px; height: 48px; border-radius: 12px;
      background: linear-gradient(135deg, #6c63ff, #a5b4fc);
      display: flex; align-items: center; justify-content: center;
      color: #fff;
    }
    .avatar .material-icons { font-size: 26px; }
    .card-info h3 { margin: 0; font-size: 15px; font-weight: 600; color: #1e1e2e; }
    .email { font-size: 13px; color: #6b7280; }
    .status-dot {
      width: 10px; height: 10px; border-radius: 50%; margin-left: auto;
    }
    .status-dot.pending { background: #f59e0b; box-shadow: 0 0 0 3px rgba(245,158,11,0.2); }

    .card-body { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
    .detail {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: #4b5563;
    }
    .detail .material-icons { font-size: 18px; color: #6c63ff; }

    .diploma-link {
      display: inline-flex; align-items: center; gap: 6px;
      color: #6c63ff; font-size: 13px; font-weight: 500;
      text-decoration: none; transition: color 0.2s;
    }
    .diploma-link:hover { color: #4b44cc; }

    .card-actions { display: flex; gap: 8px; }
    .btn {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 10px 0; border: none; border-radius: 10px;
      font-size: 13px; font-weight: 600; cursor: pointer;
      transition: all 0.2s;
    }
    .btn .material-icons { font-size: 18px; }
    .btn-approve {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
    }
    .btn-approve:hover { box-shadow: 0 4px 16px rgba(16,185,129,0.35); }
    .btn-reject {
      background: #fef2f2; color: #ef4444; border: 1px solid #fecaca;
    }
    .btn-reject:hover { background: #fee2e2; }
  `],
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
