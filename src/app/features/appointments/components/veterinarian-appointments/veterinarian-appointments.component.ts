import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-veterinarian-appointments',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatTableModule, MatSnackBarModule],
  templateUrl: './veterinarian-appointments.component.html',
  styleUrls: [],
})
export class VeterinarianAppointmentsComponent implements OnInit {
  appointments: any[] = [];
  displayedColumns = ['user', 'date', 'time', 'status', 'actions'];

  constructor(private appt: AppointmentService, private auth: AuthService, private router: Router, private snack: MatSnackBar) {}

  ngOnInit(): void {
    // ensure user is veterinarian
    const user = this.auth.currentUser$;
    const sub = this.auth.currentUser$.subscribe((u) => {
      if (!u || u.role !== 'veterinaire') {
        this.router.navigate(['/']);
        return;
      }
      this.load();
    });
  }

  load(): void {
    this.appt.getVeterinarianAppointments().subscribe({ next: (res) => (this.appointments = res || []) });
  }

  accept(id: string): void {
    this.appt.acceptAppointment(id).subscribe({ next: () => { this.snack.open('Accepted', 'Close', { duration: 2000 }); this.load(); }, error: (e) => this.snack.open('Failed', 'Close', { duration: 3000 }) });
  }

  reject(id: string): void {
    this.appt.rejectAppointment(id).subscribe({ next: () => { this.snack.open('Rejected', 'Close', { duration: 2000 }); this.load(); }, error: (e) => this.snack.open('Failed', 'Close', { duration: 3000 }) });
  }
}
