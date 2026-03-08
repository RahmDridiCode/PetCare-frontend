import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PostService } from '../../../../core/services/post.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Post } from '../../../../core/models/post.model';
import { User } from '../../../../core/models/user.model';
import { CommentsComponent } from '../comments/comments.component';
import { NewPostComponent } from '../new-post/new-post.component';
import { ReportComponent } from '../report/report.component';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    CommentsComponent,
  ],
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent implements OnInit {
  posts: Post[] = [];
  user: User | null = null;
  expandedComments: Set<string> = new Set();
  editingPostId: string | null = null;
  editDescription = '';

  constructor(
    private postService: PostService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPosts();
    if (this.authService.isAuthenticated) {
      // currentUser$ est un BehaviorSubject : il émet sa valeur courante immédiatement
      // à la souscription — pas besoin de getValue(), l'abonnement suffit
      this.authService.currentUser$.subscribe({
        next: (user) => {
          if (user) {
            this.user = user;
          } else {
            // BehaviorSubject vide : on charge depuis l'API et on l'alimente
            // pour que CommentsComponent (enfant) ait aussi accès à l'utilisateur
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
        // Trier par date décroissante : les plus récents en premier
        this.posts = posts.sort((a, b) => {
          const da = new Date(a.date).getTime();
          const db = new Date(b.date).getTime();
          return db - da;
        });
      },
    });
  }

  addLike(postId: string): void {
    if (!this.authService.isAuthenticated) return;
    this.postService.addLike(postId).subscribe({
      next: (updated) => {
        const post = this.posts.find((p) => p._id === postId);
        if (!post) return;
        // Le backend peut renvoyer le post entier OU juste { likes: [...] }
        // Dans les deux cas, on ne touche QUE post.likes pour conserver post.user intact
        if (Array.isArray(updated?.likes)) {
          post.likes = updated.likes;
        } else if (Array.isArray(updated)) {
          post.likes = updated;
        }
        // Forcer la détection de changements Angular sur le tableau
        post.likes = [...(post.likes ?? [])];
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

  startEdit(post: Post): void {
    this.editingPostId = post._id;
    this.editDescription = post.description;
  }

  cancelEdit(): void {
    this.editingPostId = null;
    this.editDescription = '';
  }

  saveEdit(postId: string): void {
    this.postService.updatePost(postId, this.editDescription).subscribe({
      next: () => {
        // On met à jour seulement la description — pas de rechargement global
        // qui écraserait les user populés et provoquerait des disparitions d'avatars
        const post = this.posts.find((p) => p._id === postId);
        if (post) {
          post.description = this.editDescription;
        }
        this.editingPostId = null;
        this.editDescription = '';
      },
    });
  }

  deletePost(postId: string): void {
    this.postService.deletePost(postId).subscribe({
      next: () => {
        // On filtre par postId directement — le backend peut ne pas renvoyer _id
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
      // NewPostComponent close() renvoie le post créé ou 'false'
      if (result && result._id) {
        // Insérer en tête sans recharger entièrement
        this.posts = [result, ...this.posts];
      } else if (result === true) {
        // Fallback : recharger
        this.loadPosts();
      }
    });
  }

  isOwner(post: Post): boolean {
    return this.user?._id === post.user?._id;
  }
}
