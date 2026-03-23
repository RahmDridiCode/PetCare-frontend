import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';

export interface LoginResponse {
  token: string;
  expiresIn: number;
  userId: string;
}

export interface SignupData {
  fname: string;
  lname: string;
  email: string;
  password: string;
  birthdate?: string;
  phone?: string;
  adresse?: {
    ville: string;
    region: string;
    street: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = environment.apiUrl;
  private token: string | null = null;
  private userId: string | null = null;
  private tokenTimer: ReturnType<typeof setTimeout> | null = null;

  private authStatus$ = new BehaviorSubject<boolean>(false);
  readonly authStatusListener = this.authStatus$.asObservable();

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  setUser(user: User) {
    this.currentUserSubject.next(user);
  }

  get isAuthenticated(): boolean {
    return this.authStatus$.value;
  }

  constructor(private http: HttpClient, private router: Router) {}

  getToken(): string | null {
    return this.token;
  }

  getUserId(): string | null {
    return this.userId;
  }

  // ────── User CRUD ──────

  getUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.api}/users/${this.userId}`);
  }

  getUserById(id: string): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.api}/users/${id}`);
  }

  getUserByName(name: string): Observable<{ users: User[] }> {
    return this.http.get<{ users: User[] }>(`${this.api}/users/search?name=${encodeURIComponent(name)}`);
  }

  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.api}/users`);
  }

  updateUser(form: Record<string, any>): Observable<{ user: User }> {
    let body: FormData | Record<string, any>;

    if (form['image'] instanceof File) {
      const fd = new FormData();
      Object.keys(form).forEach((key) => {
        const val = form[key];
        if (val && (typeof val === 'string' ? val.length > 1 : true)) {
          fd.append(key, val);
        }
      });
      body = fd;
    } else {
      body = {};
      Object.keys(form).forEach((key) => {
        const val = form[key];
        if (val && typeof val === 'string' && val.length > 1) {
          (body as Record<string, any>)[key] = val;
        }
      });
    }

    return this.http.put<{ user: User }>(`${this.api}/users/${this.userId}`, body);
  }

  // ────── Auth ──────

  signup(data: SignupData): Observable<any> {
    const user = {
      fname: data.fname,
      lname: data.lname,
      email: data.email,
      password: data.password,
      birthdate: data.birthdate,
      phone: data.phone,
    };
    return this.http.post(`${this.api}/users/signup`, user);
  }

  signupAsVeterinaire(data: SignupData): Observable<any> {
    const user = {
      fname: data.fname,
      lname: data.lname,
      email: data.email,
      password: data.password,
      role: 'veterinaire',
      birthdate: data.birthdate,
      phone: data.phone,
      adresse: data.adresse,
    };
    return this.http.post(`${this.api}/users/signup`, user);
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.api}/users/login`, { email, password })
      .pipe(
        tap((response) => {
          this.token = response.token;
          if (this.token) {
            this.userId = response.userId;
            this.setAuthTimer(response.expiresIn);
            const expirationDate = new Date(
              Date.now() + response.expiresIn * 1000
            );
            this.saveAuthData(this.token, expirationDate, this.userId!);
            this.authStatus$.next(true);
          }
        })
      );
  }

  logout(): void {
    this.token = null;
    this.userId = null;
    this.authStatus$.next(false);
    this.currentUserSubject.next(null);
    this.clearAuthData();
    if (this.tokenTimer) {
      clearTimeout(this.tokenTimer);
    }
    this.router.navigate(['/login']);
  }

  autoAuthUser(): void {
    const authData = this.getAuthData();
    if (!authData) return;

    const expiresIn = authData.expirationDate.getTime() - Date.now();
    if (expiresIn > 0) {
      this.token = authData.token;
      this.userId = authData.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatus$.next(true);
    }
  }

  // ────── Google Auth ──────

  handleGoogleLogin(idToken: string, userData: any): Observable<{ message: string; user: User }> {
    const newUser = {
      fname: userData.name,
      lname: userData.lastName,
      email: userData.email,
      image: userData.photoUrl,
      googleId: userData.id,
    };
    return this.http
      .post<{ message: string; user: User }>(`${this.api}/users/googleAuth`, newUser)
      .pipe(
        tap(() => {
          this.token = idToken;
          this.authStatus$.next(true);
        })
      );
  }

  // ────── Private helpers ──────

  private setAuthTimer(expiresInSeconds: number): void {
    this.tokenTimer = setTimeout(() => this.logout(), expiresInSeconds * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string): void {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData(): { token: string; expirationDate: Date; userId: string } | null {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    if (!token || !expiration || !userId) return null;
    return { token, expirationDate: new Date(expiration), userId };
  }
}

