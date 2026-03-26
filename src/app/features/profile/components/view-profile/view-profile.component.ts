import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../../core/services/auth.service';
import { PostService } from '../../../../core/services/post.service';
import { User } from '../../../../core/models/user.model';
import { Post } from '../../../../core/models/post.model';
import { PostComponent } from '../../../publications/components/post/post.component';

@Component({
  selector: 'app-view-profile',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    PostComponent,
  ],
  templateUrl: './view-profile.component.html',
  styleUrls: ['./view-profile.component.css'],
})
export class ViewProfileComponent implements OnInit {
  profileUser: User | null = null;
  currentUser: User | null = null;
  isOwnProfile = false;
  posts: Post[] = [];
  expandedComments: Set<string> = new Set();

  constructor(
    private authService: AuthService,
    private postService: PostService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Charger l'utilisateur courant
    this.authService.currentUser$.subscribe((u) => {
      if (u) this.currentUser = u;
    });
    if (!this.currentUser && this.authService.isAuthenticated) {
      this.authService.getUser().subscribe({ next: (res) => (this.currentUser = res.user) });
    }

    this.route.paramMap.subscribe((params: ParamMap) => {
      const id = params.get('id');
      const currentUserId = this.authService.getUserId();

      if (id && id !== currentUserId) {
        this.isOwnProfile = false;
        this.authService.getUserById(id).subscribe({
          next: (res) => {
            this.profileUser = res.user;
            this.loadPosts(res.user._id);
          },
        });
      } else {
        this.isOwnProfile = true;
        this.authService.getUser().subscribe({
          next: (res) => {
            this.profileUser = res.user;
            this.loadPosts(res.user._id);
          },
        });
      }
    });
  }

  loadPosts(userId: string): void {
    this.postService.getPostsByUser(userId).subscribe({
      next: (posts) => (this.posts = posts),
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

  addLike(postId: string): void {
    if (!this.authService.isAuthenticated) return;
    this.postService.addLike(postId).subscribe({
      next: (updated) => {
        const post = this.posts.find((p) => p._id === postId);
        if (!post) return;
        post.likes = Array.isArray(updated?.likes) ? updated.likes : Array.isArray(updated) ? updated : post.likes;
        post.likes = [...(post.likes ?? [])];
      },
    });
  }

  deletePost(postId: string): void {
    this.postService.deletePost(postId).subscribe({
      next: () => {
        this.posts = this.posts.filter((p) => p._id !== postId);
      },
    });
  }

  goToChat(): void {
    if (this.profileUser) {
      this.router.navigate(['/messages', this.profileUser._id]);
    }
  }
}
