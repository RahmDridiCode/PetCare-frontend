import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../../core/services/message.service';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

    
  userId: string | null = null;
  messages: any[] = [];
  inputText = '';
  currentUserId: string | null = null;

  constructor(private route: ActivatedRoute, private msg: MessageService, private auth: AuthService) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((p) => {
      this.userId = p.get('userId');
      if (this.userId) this.load();
    });
    const sub = this.auth.currentUser$.subscribe((u) => {
      this.currentUserId = u?._id || null;
      sub.unsubscribe();
    });
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  load(): void {
    if (!this.userId) return;
    this.msg.getConversation(this.userId).subscribe({ next: (res) => (this.messages = res || []) });
  }

  send(): void {
    if (!this.userId || !this.inputText.trim()) return;
    const text = this.inputText.trim();
    this.msg.sendMessage(this.userId, text).subscribe({ next: (m) => { this.messages.push(m); this.inputText = ''; this.scrollToBottom(); } });
  }

   private scrollToBottom(): void {
        try {
            const container = this.messagesContainer.nativeElement;
            container.scrollTop = container.scrollHeight; // scroll vers le bas du conteneur
        } catch { }
}

 
}
