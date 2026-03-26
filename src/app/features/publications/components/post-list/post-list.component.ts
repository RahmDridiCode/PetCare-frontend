import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PostService } from '../../../../core/services/post.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Post } from '../../../../core/models/post.model';
import { User } from '../../../../core/models/user.model';
import { PostComponent } from '../post/post.component';
import { NewPostComponent } from '../new-post/new-post.component';
import { ReportComponent } from '../report/report.component';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    PostComponent,
  ],
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit {
  posts: Post[] = [];
  user: User | null = null;
  expandedComments: Set<string> = new Set();

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPosts();
    if (this.authService.isAuthenticated) {
      this.authService.currentUser$.subscribe({
        next: (user) => {
          if (user) {
            this.user = user;
          } else {
            this.authService.getUser().subscribe({
              next: (res) => {
                this.user = res.user;
                this.authService.setUser(res.user);
              },
            });
          }
        },
      });
    }
  }

  loadPosts(): void {
    this.postService.getPosts().subscribe({
      next: (posts) => {
        this.posts = posts.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },
    });
  }

  addLike(postId: string): void {
    if (!this.authService.isAuthenticated) return;
    this.postService.addLike(postId).subscribe({
      next: (updated) => {
        const post = this.posts.find((p) => p._id === postId);
        if (!post) return;
        post.likes = Array.isArray(updated?.likes)
          ? updated.likes
          : Array.isArray(updated) ? updated : post.likes;
        post.likes = [...(post.likes ?? [])];
      },
    });
  }

  sharePostHandler(postId: string): void {
    if (!this.authService.isAuthenticated) return;
    this.postService.sharePost(postId).subscribe({
      next: () => {
        this.snackBar.open('Publication partagée sur votre profil !', 'Fermer', { duration: 3000 });
      },
      error: (err) => {
        const msg = err?.error?.message || 'Erreur lors du partage.';
        this.snackBar.open(msg, 'Fermer', { duration: 3000 });
      },
    });
  }

  toggleComments(postId: string): void {
    if (this.expandedComments.has(postId)) {
      this.expandedComments.delete(postId);
    } else {
      this.expandedComments.add(postId);
    }
  }

  isCommentsExpanded(postId: string): boolean {
    return this.expandedComments.has(postId);
  }

  deletePost(postId: string): void {
    this.postService.deletePost(postId).subscribe({
      next: () => {
        this.posts = this.posts.filter((p) => p._id !== postId);
      },
    });
  }

  openReport(postId: string): void {
    if (!this.user) return;
    this.dialog.open(ReportComponent, {
      width: '500px',
      data: { idpost: postId, userId: this.user._id },
    });
  }

  openNewPost(): void {
    const dialogRef = this.dialog.open(NewPostComponent, { width: '680px' });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result._id) {
        this.posts = [result, ...this.posts];
      } else if (result === true) {
        this.loadPosts();
      }
    });
  }
}
