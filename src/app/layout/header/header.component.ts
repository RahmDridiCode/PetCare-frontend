import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { Subscription } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated = false;
  user: User | null = null;
  searchQuery = '';
  searchResults: User[] = [];
  private authSub!: Subscription;
  private userSub!: Subscription;


  constructor(private authService: AuthService,private router: Router) {}

  ngOnInit(): void {


    this.authSub = this.authService.authStatusListener.subscribe((isAuth) => {
      this.isAuthenticated = isAuth;
      if (isAuth) {
        this.authService.getUser().subscribe({
          next: (res) => (this.user = res.user),
        });
      } else {
        this.user = null;
      }
    });
    this.isAuthenticated = this.authService.isAuthenticated;
    if (this.isAuthenticated) {
      this.authService.getUser().subscribe({
        next: (res) => (this.user = res.user),
      });
    }
    //  S'abonner au user courant (BehaviorSubject)
    this.userSub = this.authService.currentUser$.subscribe(
        (user) => (this.user = user) // Angular met à jour automatiquement la photo, le nom, etc.
    );
  }

  ngOnDestroy(): void {
    this.authSub.unsubscribe();
    this.userSub.unsubscribe();
  }

  search(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }
    this.authService.getUserByName(this.searchQuery).subscribe({
      next: (res) => (this.searchResults =  res.users || []), // res est déjà un tableau
    });
  }

  logout(): void {
    this.authService.logout();
  }

  goToProfile(userId: string): void {
    this.router.navigate(['/profile', userId]);
    this.searchResults = []; // vider les résultats après clic
    this.searchQuery = '';   // vider la recherche
  }
}

