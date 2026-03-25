import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MessageService } from '../../../core/services/message.service';
import { SocketService } from '../../../core/services/socket.service';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, AfterViewChecked, OnDestroy {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

    
  userId: string | null = null;
  messages: any[] = [];
  inputText = '';
  currentUserId: string | null = null;
  private subs: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private msg: MessageService,
    private auth: AuthService,
    private socket: SocketService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((p) => {
      this.userId = p.get('userId');
      if (this.userId) this.load();
    });
    const sub = this.auth.currentUser$.subscribe((u) => {
      this.currentUserId = u?._id || null;
      sub.unsubscribe();
    });
    // connect socket and subscribe to real-time messages
    this.socket.connect();
    this.subs.push(this.socket.onReceive().subscribe((m) => {
      // if message belongs to this conversation, append
      if (!this.userId) return;
      const otherId = this.userId;
      const isRelevant = (m.senderId && (m.senderId._id || m.senderId)) === (otherId) || (m.receiverId && (m.receiverId._id || m.receiverId)) === (otherId);
      if (isRelevant) {
        this.messages.push(m);
        this.scrollToBottom();
      }
        // marquer comme lu si message venant de l'autre utilisateur
      if (m.senderId === otherId) this.socket.markRead(m.senderId);
    }));
    this.subs.push(this.socket.onSent().subscribe((m) => {
      // ensure local display if messageSent is returned
      this.messages.push(m);
      this.scrollToBottom();
    }));
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
    // send via socket for real-time
    this.socket.sendMessage(this.userId, text);
    // also persist via REST for reliability
    
    this.inputText = '';
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

   private scrollToBottom(): void {
        try {
            const container = this.messagesContainer.nativeElement;
            container.scrollTop = container.scrollHeight; // scroll vers le bas du conteneur
        } catch { }
}

 
}
