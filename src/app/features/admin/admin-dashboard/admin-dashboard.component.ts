import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-root">
      <div *ngIf="loading" class="loading-row">
        <div class="spinner"></div>
      </div>

      <div *ngIf="!loading" class="cards-grid">
        <div class="stat-card" *ngFor="let c of cards" [title]="c.title">
          <div class="card-icon"><span class="material-icons">{{ c.icon }}</span></div>
          <div class="card-body">
            <div class="card-title">{{ c.title }}</div>
            <div class="card-number">{{ c.value !== null ? c.value : '—' }}</div>
          </div>
        </div>
      </div>
      
      <div *ngIf="!loading" class="two-column">
        <section class="left">
          <div class="list-card">
            <div class="list-card-header"><span class="material-icons">people</span><h3>Top Utilisateurs (par posts)</h3></div>
            <ol class="compact-list">
            <li *ngFor="let u of topPosters">
              <div class="list-row">
                <div class="list-left list-left-with-avatar">
                  <img [src]="u.user?.image || 'assets/images/avatar.jpg'" class="list-avatar" alt="" />
                  <span class="list-name">{{ u.user?.fname }} {{ u.user?.lname }}</span>
                </div>
                <div class="list-right">{{ u.posts }}<span class="muted"> posts</span></div>
              </div>
              <div class="bar-container"><div class="bar" [style.width]="barWidth(u.posts, topPostersMax)"></div></div>
            </li>
            </ol>
          </div>

          <div class="list-card">
            <div class="list-card-header"><span class="material-icons">local_hospital</span><h3>Top Vétérinaires (par RDV)</h3></div>
            <ol class="compact-list">
              <li *ngFor="let v of topVets">
                <div class="list-row">
                  <div class="list-left list-left-with-avatar">
                    <img [src]="v.vet?.image || 'assets/images/avatar.jpg'" class="list-avatar" alt="" />
                    <span class="list-name">{{ v.vet?.fname }} {{ v.vet?.lname }}</span>
                  </div>
                  <div class="list-right">{{ v.appointments }}<span class="muted"> rdv</span></div>
                </div>
                <div class="bar-container"><div class="bar bar-accent" [style.width]="barWidth(v.appointments, topVetsMax)"></div></div>
                <div class="small">avg {{ (v.avgRating||0) | number:'1.1-1' }}</div>
              </li>
            </ol>
          </div>

          <div class="list-card">
            <div class="list-card-header"><span class="material-icons">thumb_up</span><h3>Posts les plus likés</h3></div>
            <ol class="compact-list">
            <li *ngFor="let p of topLikedPosts">
              <div class="list-row">
                <div class="list-left">{{ p.post?.description || '—' | slice:0:60 }}</div>
                <div class="list-right">{{ p.likes }}<span class="muted"> likes</span></div>
              </div>
              <div class="bar-container"><div class="bar bar-like" [style.width]="barWidth(p.likes, topLikedMax)"></div></div>
            </li>
            </ol>
          </div>
        </section>

        <section class="right">
          <div class="activity-card">
            <div class="activity-header"><span class="material-icons">article</span><h3>Derniers posts</h3></div>
            <ul class="compact-list">
              <li *ngFor="let rp of recentPosts">
                <div class="item-row">
                   <img [src]="rp.user?.image || 'assets/images/avatar.jpg'" alt="" class="avatar-img" />
                  <div class="item-body">
                    <div class="item-title">{{ rp.user?.fname }} {{ rp.user?.lname }}</div>
                    <div class="item-meta">{{ rp.description || '—' | slice:0:80 }} <span class="muted">({{ rp.createdAt | date:'M/d/yy, h:mm a' }})</span></div>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div class="activity-card">
            <div class="activity-header"><span class="material-icons">event</span><h3>Derniers RDV</h3></div>
            <ul class="compact-list">
              <li *ngFor="let a of recentAppointments">
                <div class="item-row">
                  <div class="avatar"><span class="material-icons">pets</span></div>
                  <div class="item-body">
                    <div class="item-title">{{ a.userId?.fname }} → {{ a.veterinarianId?.fname }}</div>
                    <div class="item-meta">on {{ a.date | date:'M/d/yy' }} <span class="muted">{{ a.time }}</span></div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [
    `@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

    .cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 18px; max-width:1100px; margin:0 auto }
    .stat-card { display:flex; gap:12px; align-items:center; padding:18px; background:#fff; border-radius:12px; box-shadow:0 6px 18px rgba(16,24,40,0.06); transition:transform .18s ease, box-shadow .18s ease }
    .stat-card:hover { transform: translateY(-6px); box-shadow:0 12px 32px rgba(16,24,40,0.08) }
    .card-icon { width:56px; height:56px; border-radius:12px; display:flex; align-items:center; justify-content:center; background:linear-gradient(135deg,#6c63ff,#4b44cc); color:#fff; font-size:28px }
    .card-body { display:flex; flex-direction:column }
    .card-title { font-size:13px; color:#6b7280; font-weight:600 }
    .card-number { font-size:26px; font-weight:700; color:#111827; margin-top:6px }

    .loading-row { display:flex; align-items:center; justify-content:center; padding:40px }
    .spinner { width:40px; height:40px; border-radius:50%; border:4px solid #e5e7eb; border-top-color:#6c63ff; animation:spin 1s linear infinite }
    @keyframes spin { to { transform: rotate(360deg) } }
    .two-column { display:grid; grid-template-columns: 1fr 420px; gap: 24px; max-width:1100px; margin:24px auto 0 }
    .compact-list { padding-left: 18px; margin:8px 0 18px }
    .compact-list li { margin:6px 0; font-size:13px; color:#374151 }
    .two-column h3 { margin:12px 0 8px; font-size:16px }
    .two-column h4 { margin:8px 0; font-size:14px }
    .list-row { display:flex; justify-content:space-between; align-items:center }
    .list-left { font-weight:600; color:#111827 }
    .list-left-with-avatar { display:flex; align-items:center; gap:10px }
    .list-avatar { width:40px; height:40px; border-radius:50%; object-fit:cover; border:2px solid #fff; box-shadow:0 2px 6px rgba(15,23,42,0.08) }
    .list-name { font-weight:600 }
    .list-right { font-size:13px; color:#374151 }
    .muted { color:#9ca3af; margin-left:6px; font-weight:500 }
    .bar-container { height:8px; background:#f3f4f6; border-radius:6px; overflow:hidden; margin-top:8px }
    .bar { height:100%; background:linear-gradient(90deg,#60a5fa,#3b82f6); border-radius:6px }
    .bar-accent { background:linear-gradient(90deg,#7c3aed,#4c1d95) }
    .bar-like { background:linear-gradient(90deg,#f97316,#fb923c) }
    .small { color:#6b7280; font-size:12px; margin-top:6px }
    .activity-card { background:#fff; padding:14px; border-radius:12px; box-shadow:0 8px 24px rgba(15,23,42,0.06); margin-bottom:16px }
    .list-card { background:#fff; padding:14px; border-radius:12px; box-shadow:0 8px 24px rgba(15,23,42,0.06); margin-bottom:16px }
    .list-card-header { display:flex; gap:8px; align-items:center; margin-bottom:8px }
    .list-card-header h3 { margin:0; font-size:16px }
    .activity-header { display:flex; gap:8px; align-items:center; margin-bottom:8px }
    .activity-header h3 { margin:0; font-size:16px }
    .avatar { width:36px; height:36px; border-radius:50%; background:#eef2ff; display:flex; align-items:center; justify-content:center; color:#3730a3; margin-right:10px }
    .avatar-img { width:40px; height:40px; border-radius:50%; object-fit:cover; margin-right:10px; border:2px solid #fff; box-shadow:0 2px 6px rgba(15,23,42,0.08) }
    .item-row { display:flex; gap:10px; align-items:flex-start; padding:8px 0; border-bottom:1px solid #f3f4f6 }
    .item-row:last-child { border-bottom:0 }
    .item-body { flex:1 }
    .item-title { font-weight:700; color:#0f172a }
    .item-meta { color:#6b7280; font-size:13px; margin-top:4px }
    .compact-list { padding-left: 0; margin:8px 0 18px; list-style:none }
  `]
})
export class AdminDashboardComponent implements OnInit {
  loading = true;
  cards: Array<{ title: string; icon: string; value: number | null }> = [
    { title: 'Users', icon: 'group', value: null },
    { title: 'Veterinarians', icon: 'local_hospital', value: null },
    { title: 'Posts', icon: 'article', value: null },
    { title: 'Comments', icon: 'comment', value: null },
    { title: 'Appointments', icon: 'event', value: null },
    { title: 'New Users Today', icon: 'person_add', value: null },
    { title: 'New Posts Today', icon: 'post_add', value: null },
  ];

  topPosters: any[] = [];
  topVets: any[] = [];
  topLikedPosts: any[] = [];
  recentPosts: any[] = [];
  recentAppointments: any[] = [];

  // maxima for simple bar charts
  topPostersMax = 1;
  topVetsMax = 1;
  topLikedMax = 1;

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.loading = true;
    this.admin.getStats().pipe(catchError(() => of(null))).subscribe((res: any) => {
      if (!res) {
        this.loading = false;
        return;
      }
      this.cards[0].value = res.totalUsers ?? null;
      this.cards[1].value = res.totalVeterinarians ?? null;
      this.cards[2].value = res.totalPosts ?? null;
      this.cards[3].value = res.totalComments ?? null;
      this.cards[4].value = res.totalAppointments ?? null;
      // append new today stats to the extra cards
      this.cards[5].value = res.newUsersToday ?? 0;
      this.cards[6].value = res.newPostsToday ?? 0;

      this.topPosters = res.topPosters || [];
      this.topVets = res.topVets || [];
      this.topLikedPosts = res.topLikedPosts || [];
      this.recentPosts = res.recentPosts || [];
      this.recentAppointments = res.recentAppointments || [];

      // compute maxima for proportional bars
      this.topPostersMax = this.topPosters.length ? Math.max(...this.topPosters.map((p: any) => p.posts || 0)) : 1;
      this.topVetsMax = this.topVets.length ? Math.max(...this.topVets.map((v: any) => v.appointments || 0)) : 1;
      this.topLikedMax = this.topLikedPosts.length ? Math.max(...this.topLikedPosts.map((p: any) => p.likes || 0)) : 1;

      this.loading = false;
    });
  }

  barWidth(value: number, max: number) {
    if (!max || max <= 0) return '4%';
    const pct = Math.max(4, Math.round((value / max) * 100));
    return pct + '%';
  }
}
