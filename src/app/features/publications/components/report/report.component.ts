import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PostService } from '../../../../core/services/post.service';

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
})
export class ReportComponent {
  reportForm: FormGroup;
  submitted = false;

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private dialogRef: MatDialogRef<ReportComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { idpost: string; userId: string }
  ) {
    this.reportForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  onSubmit(): void {
    if (this.reportForm.invalid) return;

    const report = {
      description: this.reportForm.value.description,
      id_post: this.data.idpost,
      id_sender: this.data.userId,
    };

    this.postService.report(report).subscribe({
      next: () => {
        this.submitted = true;
        setTimeout(() => this.dialogRef.close(), 1500);
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

