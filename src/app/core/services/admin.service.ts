import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getPendingVeterinarians(): Observable<any> {
    return this.http.get(`${this.api}/admin/veterinarians/pending`);
  }

  approveVeterinarian(id: string): Observable<any> {
    return this.http.put(`${this.api}/admin/veterinarians/${id}/approve`, {});
  }

  rejectVeterinarian(id: string): Observable<any> {
    return this.http.put(`${this.api}/admin/veterinarians/${id}/reject`, {});
  }

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.api}/admin/users`);
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.api}/admin/users/${id}`);
  }

  updateUser(id: string, body: Record<string, any>): Observable<any> {
    return this.http.put(`${this.api}/users/${id}`, body);
  }

  getReportedPosts(): Observable<any> {
    return this.http.get(`${this.api}/admin/reported-posts`);
  }

  deletePost(id: string): Observable<any> {
    return this.http.delete(`${this.api}/admin/posts/${id}`);
  }

  clearReports(id: string): Observable<any> {
    return this.http.put(`${this.api}/admin/posts/${id}/clear-reports`, {});
  }
}
