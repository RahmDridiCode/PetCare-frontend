import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-veterinarian-appointments',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatSnackBarModule, MatIconModule],
  templateUrl: './veterinarian-appointments.component.html',
  styleUrls: ['./veterinarian-appointments.component.css'],
})
export class VeterinarianAppointmentsComponent implements OnInit {
  appointments: any[] = [];

  constructor(private appt: AppointmentService, private auth: AuthService, private router: Router, private snack: MatSnackBar) {}

  ngOnInit(): void {
    this.auth.currentUser$.subscribe((u) => {
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
    this.appt.acceptAppointment(id).subscribe({
      next: () => { this.snack.open('Rendez-vous accepté ✓', 'Fermer', { duration: 2500 }); this.load(); },
      error: () => this.snack.open('Échec de l\'opération', 'Fermer', { duration: 3000 })
    });
  }

  reject(id: string): void {
    this.appt.rejectAppointment(id).subscribe({
      next: () => { this.snack.open('Rendez-vous refusé', 'Fermer', { duration: 2500 }); this.load(); },
      error: () => this.snack.open('Échec de l\'opération', 'Fermer', { duration: 3000 })
    });
  }

  openMessage(userId: string) {
    this.router.navigate(['/messages', userId]);
  }
}
