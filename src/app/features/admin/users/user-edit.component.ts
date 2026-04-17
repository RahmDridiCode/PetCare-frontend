import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="edit-wrapper">
      <div class="edit-card">
        <div class="card-header">
          <div class="header-icon">
            <span class="material-icons">edit</span>
          </div>
          <h2>Modifier l'utilisateur</h2>
          <p>Mettez à jour les informations du compte</p>
        </div>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">
          <div class="form-row">
            <div class="form-group">
              <label>Prénom</label>
              <input type="text" formControlName="fname" placeholder="Prénom" />
            </div>
            <div class="form-group">
              <label>Nom</label>
              <input type="text" formControlName="lname" placeholder="Nom" />
            </div>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" formControlName="email" placeholder="Email" />
          </div>
          <div class="form-group">
            <label>Rôle</label>
            <select formControlName="role">
              <option value="user">Utilisateur</option>
              <option value="veterinaire">Vétérinaire</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-save" [disabled]="form.invalid">
              <span class="material-icons">save</span> Enregistrer
            </button>
            <button type="button" class="btn btn-cancel" (click)="cancel()">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons');

    .edit-wrapper {
      display: flex; justify-content: center; padding: 20px;
    }
    .edit-card {
      background: #fff; border-radius: 20px; padding: 36px;
      max-width: 600px; width: 100%;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .card-header { text-align: center; margin-bottom: 28px; }
    .header-icon {
      width: 56px; height: 56px; border-radius: 16px;
      background: linear-gradient(135deg, #6c63ff, #a5b4fc);
      display: inline-flex; align-items: center; justify-content: center;
      color: #fff; margin-bottom: 12px;
    }
    .header-icon .material-icons { font-size: 28px; }
    .card-header h2 { margin: 0; font-size: 22px; font-weight: 700; color: #1e1e2e; }
    .card-header p { color: #6b7280; font-size: 14px; margin-top: 4px; }

    .form { display: flex; flex-direction: column; gap: 18px; }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-group label {
      font-size: 13px; font-weight: 600; color: #374151;
    }
    .form-group input, .form-group select {
      padding: 12px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px;
      font-size: 14px; font-family: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;
      background: #fafbfd;
    }
    .form-group input:focus, .form-group select:focus {
      outline: none; border-color: #6c63ff;
      box-shadow: 0 0 0 3px rgba(108,99,255,0.12);
    }

    .form-actions {
      display: flex; gap: 10px; margin-top: 8px;
    }
    .btn {
      display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 12px 24px; border: none; border-radius: 12px;
      font-size: 14px; font-weight: 600; cursor: pointer;
      transition: all 0.2s; font-family: inherit;
    }
    .btn .material-icons { font-size: 18px; }
    .btn-save {
      flex: 1; background: linear-gradient(135deg, #6c63ff, #4b44cc);
      color: #fff;
    }
    .btn-save:hover { box-shadow: 0 4px 16px rgba(108,99,255,0.35); }
    .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-cancel {
      background: #f3f4f6; color: #6b7280;
    }
    .btn-cancel:hover { background: #e5e7eb; }
  `],
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
