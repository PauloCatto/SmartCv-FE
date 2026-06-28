import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from '../models/resume.model';
import { environment } from '../../../environments/environment';
import { BackendUser, AuthResponse } from '../models/auth.model';

const STORAGE_KEY = 'smartcv_user';
const STORAGE_TOKEN = 'smartcv_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  private userSubject = new BehaviorSubject<User | null>(this.loadCachedUser());
  private loadingSubject = new BehaviorSubject<boolean>(false);

  readonly user$: Observable<User | null> = this.userSubject.asObservable();
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();
  readonly isAuthenticated$: Observable<boolean> = this.user$.pipe(map(user => user !== null));

  constructor() {
    if (this.getToken()) {
      this.refreshUser().subscribe();
    }
  }

  get currentUserValue(): User | null {
    return this.userSubject.value;
  }

  private loadCachedUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  private mapBackendUser(user: BackendUser): User {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      plan: user.plan.toLowerCase() as 'free' | 'premium',
    };
  }

  private refreshUser(): Observable<BackendUser> {
    return this.http.get<BackendUser>(`${environment.apiUrl}/auth/me`).pipe(
      tap({
        next: (backendUser) => {
          const user = this.mapBackendUser(backendUser);
          this.userSubject.next(user);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        },
        error: () => {
          this.logout();
        }
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    this.loadingSubject.next(true);
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password }).pipe(
      tap({
        next: (response) => {
          const user = this.mapBackendUser(response.user);
          this.userSubject.next(user);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          localStorage.setItem(STORAGE_TOKEN, response.token);
          this.loadingSubject.next(false);
        },
        error: () => {
          this.loadingSubject.next(false);
        }
      })
    );
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    this.loadingSubject.next(true);
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, { name, email, password }).pipe(
      tap({
        next: (response) => {
          const user = this.mapBackendUser(response.user);
          this.userSubject.next(user);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
          localStorage.setItem(STORAGE_TOKEN, response.token);
          this.loadingSubject.next(false);
        },
        error: () => {
          this.loadingSubject.next(false);
        }
      })
    );
  }

  logout(): void {
    this.userSubject.next(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_TOKEN);
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_TOKEN);
  }
}
