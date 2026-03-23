import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';




@Component({
  selector: 'app-appointment-dashboard',
  standalone: true,
    imports: [CommonModule, 
        FormsModule,
        MatTableModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule],
  templateUrl: './appointment-dashboard.component.html',
  styleUrls: [],
})
export class AppointmentDashboardComponent implements OnInit {
  pending: any[] = [];
  accepted: any[] = [];
  rejected: any[] = [];

    pendingColumns = ['veterinarian', 'date', 'time', 'status'];
    acceptedColumns = ['veterinarian', 'date', 'time', 'status', 'rating'];
    rejectedColumns = ['veterinarian', 'date', 'time', 'status'];

  constructor(private appt: AppointmentService) {}

  ngOnInit(): void {
    this.appt.getUserAppointments().subscribe({
      next: (res) => {
        const list = res || [];
        this.pending = list.filter((a: any) => a.status === 'pending');
        this.accepted = list.filter((a: any) => a.status === 'accepted');
        this.rejected = list.filter((a: any) => a.status === 'rejected');
      },
    });
  }

    rate(a: any) {
        if (!a.newRating) return;

        this.appt.rateVeterinarian(a._id, a.newRating).subscribe({
            next: (res) => {
                a.rating = a.newRating;  // met à jour directement la ligne
                a.newRating = null;
            },
            error: (err) => console.error(err)
        });
    }
}
