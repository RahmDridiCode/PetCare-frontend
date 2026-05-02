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
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
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
    MatCardModule,
    MatIconModule,
    MatSnackBarModule,
  ],
  templateUrl: './book-appointment.component.html',
  styleUrls: ['./book-appointment.component.css'], 
  
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
    public router: Router,
    private auth: AuthService,
    private snack: MatSnackBar
  ) {}

  get selectedVeterinarian() {
    return this.veterinarians.find(v => v._id === this.veterinarianId) || null;
  }

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
    if (!this.veterinarianId) { this.snack.open('Veuillez sélectionner un vétérinaire', 'Fermer', { duration: 3000 }); return; }
    if (!this.date) { this.snack.open('Veuillez sélectionner une date', 'Fermer', { duration: 3000 }); return; }
    if (!this.time) { this.snack.open('Veuillez sélectionner une heure', 'Fermer', { duration: 3000 }); return; }

    this.loading = true;
    const payload = {
      veterinarianId: this.veterinarianId,
      date: this.date.toISOString(),
      time: this.time,
    };

    this.appt.createAppointment(payload).subscribe({
      next: () => {
        this.loading = false;
        this.snack.open('Demande de rendez-vous envoyée', 'Fermer', { duration: 3000 });
        this.router.navigate(['/appointments/my']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err?.error?.message || 'Échec de la création du rendez-vous';
        this.snack.open(msg, 'Fermer', { duration: 4000 });
      },
    });
  }
}
