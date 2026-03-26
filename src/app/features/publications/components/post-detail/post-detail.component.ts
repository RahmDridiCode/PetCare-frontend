import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PostService } from '../../../../core/services/post.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Post } from '../../../../core/models/post.model';
import { User } from '../../../../core/models/user.model';
import { PostComponent } from '../post/post.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, PostComponent, MatProgressSpinnerModule],
  template: `
    <div style="max-width:680px; margin:24px auto; padding:0 12px">
      <div *ngIf="loading" style="display:flex;justify-content:center;padding:40px">
        <mat-spinner diameter="48"></mat-spinner>
      </div>
      <div *ngIf="error" style="color:#c62828;text-align:center;padding:32px">
        <p>{{ error }}</p>
      </div>
      <app-post
        *ngIf="post && !loading"
        [post]="post"
        [currentUser]="currentUser"
        [expandedComments]="true"
      ></app-post>
    </div>
  `,
})
export class PostDetailComponent implements OnInit {
  post: Post | null = null;
  currentUser: User | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Récupérer l'utilisateur courant
    this.currentUser = null;
    this.authService.currentUser$.subscribe(u => {
      if (u) {
        this.currentUser = u;
      }
    });
    if (!this.currentUser && this.authService.isAuthenticated) {
      this.authService.getUser().subscribe({ next: (res) => (this.currentUser = res.user) });
    }

    // Charger le post par ID depuis la route
    const postId = this.route.snapshot.paramMap.get('id');
    if (!postId) {
      this.error = 'Post introuvable.';
      this.loading = false;
      return;
    }

    this.postService.getPostById(postId).subscribe({
      next: (post) => {
        this.post = post;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger ce post.';
        this.loading = false;
      },
    });
  }
}

