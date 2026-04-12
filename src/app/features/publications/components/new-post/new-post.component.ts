import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { PostService } from '../../../../core/services/post.service';

@Component({
  selector: 'app-new-post',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './new-post.component.html',
  styleUrls: ['./new-post.component.css'],
})
export class NewPostComponent {
  postForm: FormGroup;
  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

  constructor(
    private fb: FormBuilder,
    private postService: PostService,
    private dialogRef: MatDialogRef<NewPostComponent>
  ) {
    this.postForm = this.fb.group({
      description: ['', [Validators.required, Validators.minLength(3)]],
      category: [''],
    });
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const files = Array.from(input.files);
    // Ajouter les fichiers sélectionnés aux fichiers existants
    this.selectedFiles = [...this.selectedFiles, ...files]
    this.imagePreviews = [];

    for (const file of this.selectedFiles) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviews.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Réinitialiser l'input pour permettre de re-sélectionner les mêmes fichiers si besoin
    input.value = '';
  }
  removeImage(index: number): void {
    // Retirer l'image des aperçus
    this.imagePreviews.splice(index, 1);

    // Retirer le fichier correspondant
    this.selectedFiles.splice(index, 1);
  }

  onSubmit(): void {
    if (this.postForm.invalid) return;

    const { description, category } = this.postForm.value;
    this.postService.addPost(description, this.selectedFiles, category).subscribe({
      next: (createdPost) => this.dialogRef.close(createdPost),
      error: () => this.dialogRef.close(false),
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

