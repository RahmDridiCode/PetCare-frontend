import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = environment.apiUrl + '/notifications';

  constructor(private http: HttpClient) {}

  getNotifications(): Observable<any> {
    return this.http.get<any>(`${this.api}/`);
  }

  markAsRead(id: string): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}/read`, {});
  }

  getUnreadCount(): Observable<any> {
    return this.http.get<any>(`${this.api}/unread-count`);
  }
    markAllRead(): Observable<any> {
        return this.http.put<any>(`${this.api}/read-all`, {});
    }
}
