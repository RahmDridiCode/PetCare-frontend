import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MessageService } from '../../../core/services/message.service';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule],
  templateUrl: './message-list.component.html',
  styleUrls: [],
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
