import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { AuthService } from '../../../../core/services/auth.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatSelectModule,
    MatSnackBarModule,
  ],
  templateUrl: './book-appointment.component.html',
  styleUrls: [],
})
export class BookAppointmentComponent implements OnInit {
  veterinarianId: string | null = null;
  date: Date | null = null;
  time = '';
  veterinarians: any[] = [];

  loading = false;

  constructor(
    private route: ActivatedRoute,
    private appt: AppointmentService,
    private router: Router,
    private auth: AuthService,
    private snack: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.auth.currentUser$.pipe(take(1)).subscribe((u) => {
      if (!u) {
        // Pas connecté → redirection vers login
        this.router.navigate(['/login']);
        return;
      }

      if (u.role === 'veterinaire') {
        // Vétérinaire ne peut pas réserver
        this.router.navigate(['/']);
        return;
      }

      // Utilisateur authentifié
      this.veterinarianId = this.route.snapshot.queryParamMap.get('veterinarianId');

      // Récupérer la liste des vétérinaires
      this.appt.getVeterinarians().subscribe({
        next: (res) => (this.veterinarians = res || []),
        error: () => (this.veterinarians = []),
      });
    });
  }

  submit(): void {
    if (!this.veterinarianId) { this.snack.open('Please select a veterinarian', 'Close', { duration: 3000 }); return; }
    if (!this.date) { this.snack.open('Please select a date', 'Close', { duration: 3000 }); return; }
    if (!this.time) { this.snack.open('Please select a time', 'Close', { duration: 3000 }); return; }

    this.loading = true;
    const payload = {
      veterinarianId: this.veterinarianId,
      date: this.date.toISOString(),
      time: this.time,
    };

    this.appt.createAppointment(payload).subscribe({
      next: () => {
        this.loading = false;
        this.snack.open('Appointment requested successfully', 'Close', { duration: 3000 });
        this.router.navigate(['/appointments/my']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || 'Failed to create appointment';
        this.snack.open(msg, 'Close', { duration: 4000 });
      },
    });
  }
}
