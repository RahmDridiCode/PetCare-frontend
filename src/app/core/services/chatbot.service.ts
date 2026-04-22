import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private api = environment.apiUrl + '/chatbot';

  constructor(private http: HttpClient) {}

  send(message: string): Observable<any> {
    return this.http.post<any>(`${this.api}`, { message });
  }

  history(): Observable<any> {
    return this.http.get<any>(`${this.api}/history`);
  }
}
