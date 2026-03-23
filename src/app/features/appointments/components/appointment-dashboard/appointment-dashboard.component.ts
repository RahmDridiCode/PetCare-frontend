import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { MatTableModule } from '@angular/material/table';


@Component({
  selector: 'app-appointment-dashboard',
  standalone: true,
  imports: [CommonModule, MatTableModule],
  templateUrl: './appointment-dashboard.component.html',
  styleUrls: [],
})
export class AppointmentDashboardComponent implements OnInit {
  pending: any[] = [];
  accepted: any[] = [];
  rejected: any[] = [];

  displayedColumns = ['veterinarian', 'date', 'time', 'status'];

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
}
