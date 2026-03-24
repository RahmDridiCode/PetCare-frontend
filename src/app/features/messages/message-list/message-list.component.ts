import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from '../../../core/services/message.service';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';

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
    `.unread-badge { background:#d32f2f; color:white; padding:4px 8px; border-radius:12px; font-size:12px }
    `,
  ],
})
export class MessageListComponent implements OnInit {
  convos: any[] = [];

  constructor(private msg: MessageService, private router: Router) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.msg.getUsers().subscribe({ next: (res) => (this.convos = res || []) });
  }

  open(userId: string): void {
    this.router.navigate(['/messages', userId]);
  }
}
