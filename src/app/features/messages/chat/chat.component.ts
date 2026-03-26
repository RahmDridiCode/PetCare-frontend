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
  private shouldScroll = false;

  constructor(
    private route: ActivatedRoute,
    private msg: MessageService,
    private auth: AuthService,
    private socket: SocketService
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID courant depuis le service (source de vérité)
    this.currentUserId = this.auth.getUserId();

    this.route.paramMap.subscribe((p) => {
      this.userId = p.get('userId');
      if (this.userId) this.load();
    });

    // Connecter le socket
    this.socket.connect();

    // Écouter les messages entrants en temps réel
    this.subs.push(this.socket.onReceive().subscribe((m) => {
      if (!this.userId) return;
      const senderId = m.senderId?._id || m.senderId;
      const receiverId = m.receiverId?._id || m.receiverId;
      const otherId = this.userId;

      // Vérifier si ce message appartient à cette conversation
      const isRelevant = senderId === otherId || receiverId === otherId;
      if (!isRelevant) return;

      // Éviter les doublons : si le message vient de moi-même, il est déjà ajouté via onSent
      if (senderId === this.currentUserId) return;

      this.messages.push(m);
      this.shouldScroll = true;

      // Marquer comme lu immédiatement
      this.socket.markRead(senderId);
    }));

    // Confirmation d'envoi de l'expéditeur
    this.subs.push(this.socket.onSent().subscribe((m) => {
      this.messages.push(m);
      this.shouldScroll = true;
    }));
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  load(): void {
    if (!this.userId) return;
    this.msg.getConversation(this.userId).subscribe({
      next: (res) => {
        this.messages = res || [];
        this.shouldScroll = true;
        // Marquer les messages comme lus via socket aussi
        if (this.userId) this.socket.markRead(this.userId);
      }
    });
  }

  send(): void {
    if (!this.userId || !this.inputText.trim()) return;
    const text = this.inputText.trim();
    this.inputText = '';
    // Envoyer via socket (temps réel + persistance via server.js)
    this.socket.sendMessage(this.userId, text);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private scrollToBottom(): void {
    try {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;
    } catch { }
  }
}
