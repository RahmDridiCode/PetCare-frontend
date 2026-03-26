import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommentsComponent } from '../comments/comments.component';
import { Post } from '../../../../core/models/post.model';
import { User } from '../../../../core/models/user.model';
import { PostService } from '../../../../core/services/post.service';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    CommentsComponent,
  ],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
})
export class PostComponent implements OnInit {
  @Input() post!: Post;
  @Input() currentUser: User | null = null;
  @Input() expandedComments: boolean = false;
  /** Masquer le bouton partager (ex: dans le profil) */
  @Input() showShare: boolean = true;

  @Output() like = new EventEmitter<string>();
  @Output() toggleComments = new EventEmitter<string>();
  @Output() deletePost = new EventEmitter<string>();
  @Output() editPost = new EventEmitter<Post>();
  @Output() reportPost = new EventEmitter<string>();
  @Output() sharePost = new EventEmitter<string>();

  // Edition inline
  isEditing = false;
  editDescription = '';
  editImages: string[] = [];
  editNewFiles: File[] = [];

  // Carousel
  carouselOpen = false;
  carouselIndex = 0;

  constructor(private postService: PostService) {}

  ngOnInit(): void {}

  get isOwner(): boolean {
    return this.currentUser?._id === this.post?.user?._id;
  }

  hasLiked(): boolean {
    if (!this.currentUser || !this.post?.likes) return false;
    return this.post.likes.some((l: any) => {
      const id = typeof l === 'string' ? l : l.user || l._id;
      return id === this.currentUser!._id;
    });
  }

  onLike(): void {
    this.like.emit(this.post._id);
  }

  onToggleComments(): void {
    this.toggleComments.emit(this.post._id);
  }

  onDelete(): void {
    this.deletePost.emit(this.post._id);
  }

  onReport(): void {
    this.reportPost.emit(this.post._id);
  }

  onShare(): void {
    this.sharePost.emit(this.post._id);
  }

  /** Vrai si ce post est un partage et que l'auteur du partage n'est pas le propriétaire du post */
  get isSharedPost(): boolean {
    return !!this.post.sharedBy;
  }

  /** Afficher le bouton partager : showShare=true ET pas le propriétaire ET pas déjà un post partagé */
  get canShare(): boolean {
    if (!this.showShare) return false;
    if (!this.currentUser) return false;
    if (this.isOwner) return false;
    return true;
  }

  startEdit(): void {
    this.isEditing = true;
    this.editDescription = this.post.description;
    this.editImages = [...this.post.images];
    this.editNewFiles = [];
    this.editPost.emit(this.post);
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editDescription = '';
    this.editImages = [];
    this.editNewFiles = [];
  }

  onEditFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const files = Array.from(input.files);
    this.editNewFiles.push(...files);
    for (const file of files) {
      const reader = new FileReader();
      reader.onload = () => this.editImages.push(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  removeEditImage(index: number): void {
    this.editImages.splice(index, 1);
  }

  saveEdit(): void {
    const formData = new FormData();
    formData.append('description', this.editDescription);
    this.editNewFiles.forEach(file => formData.append('images', file));
    formData.append('existingImages', JSON.stringify(
      this.editImages.filter(img => !img.startsWith('data:'))
    ));

    this.postService.updatePost(this.post._id, formData).subscribe({
      next: (updatedPost) => {
        this.post.description = updatedPost.description;
        this.post.images = updatedPost.images;
        this.cancelEdit();
      },
    });
  }

  // Carousel
  openCarousel(index: number): void {
    this.carouselIndex = index;
    this.carouselOpen = true;
  }

  closeCarousel(): void {
    this.carouselOpen = false;
  }

  prevImage(): void {
    if (!this.post.images?.length) return;
    this.carouselIndex = (this.carouselIndex - 1 + this.post.images.length) % this.post.images.length;
  }

  nextImage(): void {
    if (!this.post.images?.length) return;
    this.carouselIndex = (this.carouselIndex + 1) % this.post.images.length;
  }
}
