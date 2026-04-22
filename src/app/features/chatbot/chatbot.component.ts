import { Component, OnInit, AfterViewChecked, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ChatbotService } from '../../core/services/chatbot.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css'],
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  messages: any[] = [];
  inputText = '';
  private shouldScroll = false;

  constructor(private api: ChatbotService) {}

  ngOnInit(): void {
    this.loadHistory();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  loadHistory(): void {
    this.api.history().subscribe({
      next: (res) => {
        this.messages = res.messages || [];
        this.shouldScroll = true;
      },
      error: () => {},
    });
  }

  send(): void {
    const text = this.inputText && this.inputText.trim();
    if (!text) return;
    // push locally
    this.messages.push({ role: 'user', content: text, createdAt: new Date() });
    this.inputText = '';
    this.shouldScroll = true;

    // send to backend
    this.api.send(text).subscribe({
      next: (res) => {
        const reply = res.reply || '...';
        this.messages.push({ role: 'assistant', content: reply, createdAt: new Date() });
        this.shouldScroll = true;
      },
      error: () => {
        this.messages.push({ role: 'assistant', content: 'Sorry, I could not reach the AI service.' , createdAt: new Date() });
        this.shouldScroll = true;
      }
    });
  }

  private scrollToBottom(): void {
    try {
      const c = this.messagesContainer.nativeElement;
      c.scrollTop = c.scrollHeight;
    } catch {}
  }
}
