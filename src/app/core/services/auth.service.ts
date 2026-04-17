import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, switchMap, map } from 'rxjs';
import jwt_decode from 'jwt-decode';
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

interface DecodedToken {
  userId?: string;
  email?: string;
  role?: string;
  isApproved?: boolean;
  fname?: string;
  lname?: string;
  exp?: number;
  iat?: number;
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
  private decodedToken: DecodedToken | null = null;

  // Référence lazy au SocketService pour éviter la dépendance circulaire
  private socketServiceRef: { disconnect: () => void } | null = null;

  setSocketService(ref: { disconnect: () => void }): void {
    this.socketServiceRef = ref;
  }

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

  decodeToken(token?: string): DecodedToken | null {
    const t = token ?? this.token;
    if (!t) return null;
    try {
      return jwt_decode(t) as DecodedToken;
    } catch (e) {
      return null;
    }
  }

  getDecodedToken(): DecodedToken | null {
    if (!this.decodedToken) this.decodedToken = this.decodeToken();
    return this.decodedToken;
  }

  isTokenValid(): boolean {
    const d = this.decodeToken();
    if (!d || !d.exp) return false;
    return d.exp * 1000 > Date.now();
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

  signupVeterinaireWithDiploma(formData: FormData): Observable<any> {
    return this.http.post(`${this.api}/users/signup`, formData);
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.api}/users/login`, { email, password }).pipe(
      // store token and userId
      tap((response) => {
        this.token = response.token;
        if (this.token) {
          this.userId = response.userId;
          this.decodedToken = this.decodeToken(this.token);
          // populate minimal current user from token to avoid extra API calls in guards
          if (this.decodedToken) {
            this.currentUserSubject.next({
              _id: this.decodedToken.userId as any,
              fname: this.decodedToken.fname || '',
              lname: this.decodedToken.lname || '',
              email: this.decodedToken.email || '',
              role: this.decodedToken.role || 'user',
              isApproved: this.decodedToken.isApproved as any,
            } as any);
          }
          this.setAuthTimer(response.expiresIn);
          const expirationDate = new Date(Date.now() + response.expiresIn * 1000);
          this.saveAuthData(this.token, expirationDate, this.userId!);
          this.authStatus$.next(true);
        }
      }),
      // then load the full user and populate currentUserSubject before completing
      switchMap((response) =>
        this.getUser().pipe(
          tap((res) => this.currentUserSubject.next(res.user)),
          map(() => response)
        )
      )
    );
  }

  logout(): void {
    // Déconnecter le socket AVANT de vider le token
    if (this.socketServiceRef) {
      this.socketServiceRef.disconnect();
    }
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
      this.decodedToken = this.decodeToken(this.token);

      this.setAuthTimer(expiresIn / 1000);
      this.authStatus$.next(true);
      // populate minimal user from token so guards work without API calls
      if (this.decodedToken) {
        this.currentUserSubject.next({
          _id: this.decodedToken.userId as any,
          fname: this.decodedToken.fname || '',
          lname: this.decodedToken.lname || '',
          email: this.decodedToken.email || '',
          role: this.decodedToken.role || 'user',
          isApproved: this.decodedToken.isApproved as any,
        } as any);
      }
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

