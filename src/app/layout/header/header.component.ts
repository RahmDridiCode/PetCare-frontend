import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { Router } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { SocketService } from '../../core/services/socket.service';
import { MessageService } from '../../core/services/message.service';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatBadgeModule,
    MatListModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  user: User | null = null;
  searchQuery = '';
  searchResults: User[] = [];
  private authSub!: Subscription;
  private userSub!: Subscription;
  notifCount = 0;
  msgCount = 0;
  notifications: any[] = [];
  private socketNotifSub!: Subscription;
  private socketNotifCountSub!: Subscription;
  private socketMsgCountSub!: Subscription;


  constructor(private authService: AuthService, public router: Router, private notifService: NotificationService, private socket: SocketService, private msgService: MessageService) {}

  ngOnInit(): void {
    this.authSub = this.authService.authStatusListener.subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
      if (isAuth) {
        this.authService.getUser().subscribe({
          next: (res) => (this.user = res.user),
        });
        // Charger les compteurs et connecter le socket à chaque (re)connexion
        this.notifService.getUnreadCount().subscribe({ next: (r) => (this.notifCount = r.count || 0), error: () => {} });
        this.msgService.getUnreadCount().subscribe({ next: (r) => (this.msgCount = r.count || 0), error: () => {} });
        this.socket.connect();
      } else {
        this.user = null;
        this.notifCount = 0;
        this.msgCount = 0;
        this.notifications = [];
      }
    });

    this.isAuthenticated = this.authService.isAuthenticated;
    if (this.isAuthenticated) {
      this.authService.getUser().subscribe({
        next: (res) => (this.user = res.user),
      });
      this.notifService.getUnreadCount().subscribe({ next: (r) => (this.notifCount = r.count || 0), error: () => {} });
      this.msgService.getUnreadCount().subscribe({ next: (r) => (this.msgCount = r.count || 0), error: () => {} });
      this.socket.connect();
    }

    // S'abonner au user courant (BehaviorSubject)
    this.userSub = this.authService.currentUser$.subscribe(
      (user) => (this.user = user)
    );

    // Écoute socket notifications
    this.socketNotifCountSub = this.socket.onNotificationsCount().subscribe((p: any) => { this.notifCount = p.count || 0; });
    this.socketNotifSub = this.socket.onNotification().subscribe((n: any) => {
      this.notifications.unshift(n);
      this.notifCount += 1;
    });
    this.socketMsgCountSub = this.socket.onMessagesCount().subscribe((p: any) => { this.msgCount = p.count || 0; });
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.userSub.unsubscribe();
    this.socketNotifCountSub?.unsubscribe();
    this.socketNotifSub?.unsubscribe();
    this.socketMsgCountSub?.unsubscribe();
  }

  openNotificationsMenu(): void {
    // load notifications and mark all as read
    this.notifService.getNotifications().subscribe({ next: (res) => (this.notifications = res || []) });
    this.notifService.markAllRead().subscribe({ next: () => { this.notifCount = 0; }, error: () => {} });
  }

  openNotificationItem(n: any): void {
    const post = n.postId;
    if (!post) return;
    // Le backend stocke toujours l'_id du post exact concerné :
    // - like/comment sur post partagé → postId = post partagé → affiche le post partagé
    // - like/comment sur post original → postId = post original → affiche le post original
    // - share → postId = post partagé → affiche le post partagé
    const targetId = post._id || post;
    this.router.navigate(['/post', targetId]);
  }

  goToMessageList(): void {
    this.router.navigate(['/messages']);
  }

  search(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }
    this.authService.getUserByName(this.searchQuery).subscribe({
      next: (res) => (this.searchResults =  res.users || []), // res est déjà un tableau
    });
  }

  logout(): void {
    this.authService.logout();
  }

  goToProfile(userId: string): void {
    this.router.navigate(['/profile', userId]);
    this.searchResults = []; // vider les résultats après clic
    this.searchQuery = '';   // vider la recherche
  }
}

