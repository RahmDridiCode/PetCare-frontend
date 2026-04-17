import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-signup-veterinaire',
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
  templateUrl: './signup-veterinaire.component.html',
  styleUrls: ['./signup-veterinaire.component.css'],
})
export class SignupVeterinaireComponent {
  registerForm!: FormGroup;
  hidePassword = true;
  errorMessage = '';
  diplomaFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fname: ['', [Validators.required, Validators.maxLength(50)]],
      lname: ['', [Validators.required, Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      phone: ['', [Validators.pattern('[0-9]{8}')]],
      birthdate: [''],
      adresse: this.fb.group({
        ville: ['', Validators.required],
        region: ['', Validators.required],
        street: [''],
      }),
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    const { password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    // Prepare FormData to include diploma PDF
    const formData = new FormData();
    const values = this.registerForm.value;
    formData.append('fname', values.fname);
    formData.append('lname', values.lname);
    formData.append('email', values.email);
    formData.append('password', values.password);
    formData.append('role', 'veterinaire');
    if (values.phone) formData.append('phone', values.phone);
    if (values.birthdate) formData.append('birthdate', values.birthdate);
    if (values.adresse) {
      try {
        formData.append('adresse', JSON.stringify(values.adresse));
      } catch (e) {}
    }
    if (this.diplomaFile) {
      formData.append('diploma', this.diplomaFile, this.diplomaFile.name);
    }

    this.authService.signupVeterinaireWithDiploma(formData).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.message || "Erreur lors de l'inscription.";
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type !== 'application/pdf') {
        this.errorMessage = 'Veuillez fournir un fichier PDF.';
        this.diplomaFile = null;
        return;
      }
      this.diplomaFile = file;
    }
  }
}

