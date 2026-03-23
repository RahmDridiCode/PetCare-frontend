import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-veterinarian-list',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './veterinarian-list.component.html',
  styleUrls: [],
})
export class VeterinarianListComponent implements OnInit {
  veterinarians: any[] = [];

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.auth.getAllUsers().subscribe({
      next: (users) => {
        this.veterinarians = users.filter((u: any) => u.role === 'veterinaire');
      },
    });
  }

  book(vetId: string): void {
    this.router.navigate(['/appointments/book'], { queryParams: { veterinarianId: vetId } });
  }
}
