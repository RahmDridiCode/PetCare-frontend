import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/services/auth.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
})
export class EditProfileComponent implements OnInit {
  profileForm: FormGroup;
  user: User | null = null;
  imagePreview: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      fname: ['', [Validators.maxLength(50)]],
      lname: ['', [Validators.maxLength(50)]],
      email: ['', [Validators.email]],
      phone: ['', [Validators.pattern('[0-9]{8}')]],
      birthdate: [''],
      image: [null],
      adresse: this.fb.group({
        ville: [''],
        region: [''],
        street: [''],
      }),
    });
  }

  ngOnInit(): void {
    this.authService.getUser().subscribe({
      next: (res) => {
        this.user = res.user;
        this.profileForm.patchValue({
          fname: this.user.fname,
          lname: this.user.lname,
          email: this.user.email,
          phone: this.user.phone || '',
          birthdate: this.user.birthdate || '',
          adresse: this.user.adresse || { ville: '', region: '', street: '' },
        });
      },
    });
  }

  onImagePicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    this.profileForm.patchValue({ image: file });

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.authService.updateUser(this.profileForm.value).subscribe({
      next: (res) => {
        this.authService.setUser(res.user);
        this.router.navigate(['/profile']);
      },
    });
  }
}

