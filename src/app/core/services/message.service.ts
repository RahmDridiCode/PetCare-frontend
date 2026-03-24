import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MessageService {
  private api = environment.apiUrl + '/messages';

  constructor(private http: HttpClient) {}

  sendMessage(receiverId: string, text: string): Observable<any> {
    return this.http.post<any>(`${this.api}/send`, { receiverId, text });
  }

  getConversation(userId: string): Observable<any> {
    return this.http.get<any>(`${this.api}/conversation/${userId}`);
  }

  getUsers(): Observable<any> {
    return this.http.get<any>(`${this.api}/users`);
  }
}
