import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from '../../../core/services/message.service';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { SocketService } from '../../../core/services/socket.service';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatCardModule, MatBadgeModule],
  templateUrl: './message-list.component.html',
  styles: [
    `:host { font-family: Roboto, Arial, sans-serif; display:block; padding:12px }`,
    `.convo-card { margin-bottom:10px; cursor:pointer; transition: transform .12s ease, box-shadow .12s ease; }`,
    `.convo-card:hover { transform: translateY(-3px); box-shadow: 0 6px 18px rgba(0,0,0,0.08); }`,
    `.convo-row { display:flex; align-items:center; gap:12px; padding:12px; }`,
    `.convo-avatar { width:52px; height:52px; border-radius:50%; object-fit:cover }`,
    `.convo-body { flex:1; min-width:0 }`,
    `.convo-name { font-weight:600 }`,
    `.convo-last { color:#666; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis }`,
    `.convo-meta { color:#999; font-size:12px; margin-left:8px }`,
    `.unread-badge { background:#d32f2f; color:white; padding:4px 8px; border-radius:12px; font-size:12px }`,
  ],
})
export class MessageListComponent implements OnInit, OnDestroy {
  convos: any[] = [];
  private subs: Subscription[] = [];

  constructor(
    private msg: MessageService,
    private router: Router,
    private socket: SocketService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.load();
    this.socket.connect();

    this.subs.push(this.socket.onReceive().subscribe((m) => {
      const currentId = this.getCurrentUserId();
      const senderId = m.senderId?._id || m.senderId;
      const receiverId = m.receiverId?._id || m.receiverId;
      const otherId = senderId === currentId ? receiverId : senderId;

      const conv = this.convos.find(c => c.user._id === otherId);
      if (conv) {
        conv.lastMessage = m.text;
        conv.lastAt = m.createdAt;
        if (senderId !== currentId) conv.unreadCount = (conv.unreadCount || 0) + 1;
      } else {
        const user = senderId === currentId ? m.receiverId : m.senderId;
        this.convos.unshift({ user, lastMessage: m.text, lastAt: m.createdAt, unreadCount: senderId !== currentId ? 1 : 0 });
      }
    }));

    this.subs.push(this.socket.onRead().subscribe((p) => {
      const otherId = p.from;
      const conv = this.convos.find(c => c.user._id === otherId);
      if (conv) conv.unreadCount = 0;
    }));
  }

  private getCurrentUserId(): string | null {
    return this.auth.getUserId();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  load(): void {
    this.msg.getUsers().subscribe({ next: (res) => (this.convos = res || []) });
  }

  open(userId: string): void {
    this.router.navigate(['/messages', userId]);
  }
}
