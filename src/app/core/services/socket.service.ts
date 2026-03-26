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
  private notification$ = new Subject<any>();
  private notificationsCount$ = new Subject<any>();
  private messagesCount$ = new Subject<any>();

  constructor(private auth: AuthService, private zone: NgZone) {
    // Enregistrer la référence dans AuthService pour que logout() puisse déconnecter le socket
    this.auth.setSocketService(this);
  }

  connect(): void {
    if (this.socket?.connected) return;
    // Si un ancien socket existe mais n'est plus connecté, le détruire proprement
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    const token = this.auth.getToken();
    if (!token) return;
    this.socket = io(environment.apiUrl.replace('/api', ''), { auth: { token } });

    this.socket.on('receiveMessage', (m: any) => {
      this.zone.run(() => this.receive$.next(m));
    });

    this.socket.on('messageSent', (m: any) => {
      this.zone.run(() => this.sent$.next(m));
    });

    this.socket.on('messagesRead', (payload: any) => {
      this.zone.run(() => this.read$.next(payload));
    });

    this.socket.on('notification', (n: any) => {
      this.zone.run(() => this.notification$.next(n));
    });

    this.socket.on('notificationsCount', (p: any) => {
      this.zone.run(() => this.notificationsCount$.next(p));
    });

    this.socket.on('messagesCount', (p: any) => {
      this.zone.run(() => this.messagesCount$.next(p));
    });
  }

  disconnect(): void {
    if (!this.socket) return;
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
  }

  onReceive(): Observable<any> { return this.receive$.asObservable(); }
  onSent(): Observable<any> { return this.sent$.asObservable(); }
  onRead(): Observable<any> { return this.read$.asObservable(); }
  onNotification(): Observable<any> { return this.notification$.asObservable(); }
  onNotificationsCount(): Observable<any> { return this.notificationsCount$.asObservable(); }
  onMessagesCount(): Observable<any> { return this.messagesCount$.asObservable(); }

  sendMessage(receiverId: string, text: string): void {
    if (!this.socket?.connected) this.connect();
    this.socket?.emit('sendMessage', { receiverId, text });
  }

  markRead(otherId: string): void {
    this.socket?.emit('messagesRead', { from: otherId });
  }
}
