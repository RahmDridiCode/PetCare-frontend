import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PostService } from '../../../../core/services/post.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Comment } from '../../../../core/models/comment.model';
import { User } from '../../../../core/models/user.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css'],
})
export class CommentsComponent implements OnInit, OnDestroy {
  @Input({ required: true }) postId!: string;

  comments: Comment[] = [];
  user: User | null = null;
  newCommentText = '';
  editingCommentId: string | null = null;
  editCommentText = '';

  private userSub!: Subscription;

  constructor(
    private postService: PostService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadComments();

    // ✅ On s'abonne au BehaviorSubject currentUser$ — valeur disponible immédiatement
    // sans attendre un appel HTTP, ce qui garantit que this.user est prêt avant addComment()
    this.userSub = this.authService.currentUser$.subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
        } else if (this.authService.isAuthenticated) {
          // Fallback : si currentUser$ est null mais l'utilisateur est connecté,
          // on charge depuis l'API UNE seule fois et on alimente le BehaviorSubject
          this.authService.getUser().subscribe({
            next: (res) => {
              this.authService.setUser(res.user);
            },
          });
        }
      },
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  loadComments(): void {
    this.postService.getAllComments(this.postId).subscribe({
      next: (comments) => (this.comments = comments),
    });
  }

  addComment(): void {
    if (!this.newCommentText.trim()) return;

    const textToSend = this.newCommentText;
    this.newCommentText = ''; // Vider le champ immédiatement (UX réactive)

    this.postService.addComment(this.postId, textToSend).subscribe({
      next: (comment) => {
        // Vérifier si comment.user est un objet User complet (populé) ou juste un _id string
        const userIsPopulated =
          comment.user &&
          typeof comment.user === 'object' &&
          (comment.user as User).fname !== undefined;

        const enrichedComment: Comment = {
          // ✅ _id : obligatoire pour que @for (track comment._id) puisse rendre l'élément
          // Si le backend ne le renvoie pas, on génère un id temporaire unique
          _id: comment._id || `temp_${Date.now()}`,
          text: textToSend,                             // ✅ Toujours utiliser le texte local
          date: comment.date || new Date(),             // ✅ Date locale si absente
          user: userIsPopulated ? comment.user : (this.user as User), // ✅ Avatar garanti
        };

        // ✅ Nouveau tableau pour déclencher la détection de changements Angular
        this.comments = [...this.comments, enrichedComment];
      },
      error: () => {
        this.newCommentText = textToSend;
      },
    });
  }

  deleteComment(commentId: string): void {
    this.postService.deleteComment(this.postId, commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter((c) => c._id !== commentId);
      },
    });
  }

  startEditComment(comment: Comment): void {
    this.editingCommentId = comment._id;
    this.editCommentText = comment.text;
  }

  cancelEditComment(): void {
    this.editingCommentId = null;
    this.editCommentText = '';
  }

  saveEditComment(commentId: string): void {
    this.postService
      .updateComment(this.postId, commentId, this.editCommentText)
      .subscribe({
        next: () => {
          // ✅ On met à jour seulement le texte — on conserve comment.user intact (avatar préservé)
          const comment = this.comments.find((c) => c._id === commentId);
          if (comment) {
            comment.text = this.editCommentText;
            // Nouveau tableau pour forcer la détection de changements
            this.comments = [...this.comments];
          }
          this.editingCommentId = null;
          this.editCommentText = '';
        },
      });
  }

  isCommentOwner(comment: Comment): boolean {
    return this.user?._id === comment.user?._id;
  }
}

