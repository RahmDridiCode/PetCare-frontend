import { Injectable, NgZone } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;
  private receive$ = new Subject<any>();
  private sent$ = new Subject<any>();
  private read$ = new Subject<any>();

  constructor(private auth: AuthService, private zone: NgZone) {}

  connect(): void {
    if (this.socket) return;
    const token = this.auth.getToken();
    this.socket = io(environment.apiUrl.replace('/api',''), { auth: { token } });

    this.socket.on('receiveMessage', (m: any) => {
      this.zone.run(() => this.receive$.next(m));
    });

    this.socket.on('messageSent', (m: any) => {
      this.zone.run(() => this.sent$.next(m));
    });

    this.socket.on('messagesRead', (payload: any) => {
      this.zone.run(() => this.read$.next(payload));
    });
  }

  disconnect(): void {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }

  onReceive(): Observable<any> { return this.receive$.asObservable(); }
  onSent(): Observable<any> { return this.sent$.asObservable(); }
  onRead(): Observable<any> { return this.read$.asObservable(); }

  sendMessage(receiverId: string, text: string): void {
    if (!this.socket) this.connect();
    this.socket?.emit('sendMessage', { receiverId, text });
  }

  markRead(otherId: string): void {
    // optional: notify server via socket that messages were read
    this.socket?.emit('messagesRead', { from: otherId });
  }
}
