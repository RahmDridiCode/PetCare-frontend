import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatCardModule],
  template: `
    <mat-card class="edit-card">
      <mat-card-header>
        <mat-card-title>Modifier utilisateur</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <mat-form-field appearance="outline" class="full">
            <mat-label>Prénom</mat-label>
            <input matInput formControlName="fname" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Nom</mat-label>
            <input matInput formControlName="lname" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="full">
            <mat-label>Role</mat-label>
            <input matInput formControlName="role" />
          </mat-form-field>
          <div style="margin-top:12px;display:flex;gap:8px;">
            <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Enregistrer</button>
            <button mat-button type="button" (click)="cancel()">Annuler</button>
          </div>
        </form>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.full{width:100%}.edit-card{max-width:720px;margin:12px auto}`],
})
export class UserEditComponent implements OnInit {
  form = this.fb.group({
    fname: ['', Validators.required],
    lname: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['user'],
  });
  id = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private admin: AdminService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((pm) => {
      const id = pm.get('id');
      if (!id) return;
      this.id = id;
      this.auth.getUserById(id).subscribe({ next: (res: any) => {
        const u = res.user;
        this.form.patchValue({ fname: u.fname, lname: u.lname, email: u.email, role: u.role || 'user' });
      }});
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.admin.updateUser(this.id, this.form.value).subscribe(() => this.router.navigate(['/admin/users']));
  }

  cancel(): void {
    this.router.navigate(['/admin/users']);
  }
}
