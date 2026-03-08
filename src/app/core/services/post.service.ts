import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Post } from '../models/post.model';
import { Comment } from '../models/comment.model';
import { Report } from '../models/report.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PostService {
  private readonly api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ────── Error handler ──────

  private handleError(error: HttpErrorResponse): Observable<never> {
    if (error.error instanceof ErrorEvent) {
      console.error('Client error:', error.error.message);
    } else {
      console.error(`Backend error ${error.status}:`, error.error);
    }
    return throwError(() => new Error('Something went wrong; please try again later.'));
  }

  // ────── Posts CRUD ──────

  getPosts(): Observable<Post[]> {
    return this.http
      .get<Post[]>(`${this.api}/posts`)
      .pipe(catchError(this.handleError));
  }

  getPostById(id: string): Observable<Post> {
    return this.http
      .get<Post>(`${this.api}/posts/${id}`)
      .pipe(catchError(this.handleError));
  }

  addPost(description: string, images: File[], categorie: string): Observable<Post> {
    const formData = new FormData();
    formData.append('description', description);
    formData.append('categorie', categorie);
    for (const image of images) {
      formData.append('images', image);
    }
    return this.http
      .post<Post>(`${this.api}/posts`, formData)
      .pipe(catchError(this.handleError));
  }

  updatePost(id: string, description: string): Observable<Post> {
    return this.http
      .put<Post>(`${this.api}/posts/${id}`, { description })
      .pipe(catchError(this.handleError));
  }

  deletePost(id: string): Observable<Post> {
    return this.http
      .delete<Post>(`${this.api}/posts/${id}`)
      .pipe(catchError(this.handleError));
  }

  // ────── Comments ──────

  getAllComments(postId: string): Observable<Comment[]> {
    return this.http
      .get<Comment[]>(`${this.api}/posts/${postId}/comments/`)
      .pipe(catchError(this.handleError));
  }

  addComment(postId: string, text: string): Observable<Comment> {
    return this.http
      .post<Comment>(`${this.api}/posts/${postId}/comment`, { text })
      .pipe(catchError(this.handleError));
  }

  updateComment(postId: string, commentId: string, text: string): Observable<any> {
    return this.http
      .put(`${this.api}/posts/${postId}/Comment/${commentId}`, { text })
      .pipe(catchError(this.handleError));
  }

  deleteComment(postId: string, commentId: string): Observable<any> {
    return this.http
      .delete(`${this.api}/posts/${postId}/Comment/${commentId}`)
      .pipe(catchError(this.handleError));
  }

  // ────── Likes ──────

  getLikes(postId: string): Observable<any> {
    return this.http
      .get(`${this.api}/posts/${postId}/likes/`)
      .pipe(catchError(this.handleError));
  }

  addLike(postId: string): Observable<any> {
    return this.http
      .post(`${this.api}/posts/${postId}/like/`, {})
      .pipe(catchError(this.handleError));
  }

  // ────── Report ──────

  report(data: Report): Observable<any> {
    return this.http
      .post(`${this.api}/reports/send/${data.id_sender}/${data.id_post}`, data)
      .pipe(catchError(this.handleError));
  }
}

