import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface AppointmentPayload {
  veterinarianId: string;
  date: string; // ISO date
  time: string; // HH:MM
}

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private api = environment.apiUrl + '/appointments';

  constructor(private http: HttpClient) {}

  createAppointment(payload: AppointmentPayload): Observable<any> {
    return this.http.post<any>(`${this.api}`, payload);
  }

  getUserAppointments(): Observable<any> {
    return this.http.get<any>(`${this.api}/user`);
  }

  getVeterinarians(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl.replace('/api','')}/api/veterinarians`);
  }

  getVeterinarianAppointments(): Observable<any> {
    return this.http.get<any>(`${this.api}/veterinarian`);
  }

  acceptAppointment(id: string): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}/accept`, {});
  }

  rejectAppointment(id: string): Observable<any> {
    return this.http.put<any>(`${this.api}/${id}/reject`, {});
  }
}
