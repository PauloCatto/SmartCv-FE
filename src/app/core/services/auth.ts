import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User } from '../models/resume.model';
import { environment } from '../../../environments/environment';

const STORAGE_KEY = 'smartcv_user';
const STORAGE_TOKEN = 'smartcv_token';

interface BackendUser {
  id: string;
  name: string;
  email: string;
  plan: 'FREE' | 'PREMIUM';
}

interface AuthResponse {
  user: BackendUser;
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private _user = signal<User | null>(this.loadCachedUser());
  private _loading = signal(false);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  constructor() {
    // If we have a token, fetch fresh user data on startup
    if (this.getToken()) {
      this.refreshUser();
    }
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

  private async refreshUser(): Promise<void> {
    try {
      const backendUser = await firstValueFrom(
        this.http.get<BackendUser>(`${environment.apiUrl}/auth/me`)
      );
      const user = this.mapBackendUser(backendUser);
      this._user.set(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      // Token is invalid/expired
      this.logout();
    }
  }

  async login(email: string, password: string): Promise<void> {
    this._loading.set(true);
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      );
      
      const user = this.mapBackendUser(response.user);
      this._user.set(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(STORAGE_TOKEN, response.token);
    } catch (err: any) {
      const errorMsg = err?.error?.error || 'Email ou senha inválidos';
      throw new Error(errorMsg);
    } finally {
      this._loading.set(false);
    }
  }

  async register(name: string, email: string, password: string): Promise<void> {
    this._loading.set(true);
    try {
      const response = await firstValueFrom(
        this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, { name, email, password })
      );

      const user = this.mapBackendUser(response.user);
      this._user.set(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      localStorage.setItem(STORAGE_TOKEN, response.token);
    } catch (err: any) {
      const errorMsg = err?.error?.error || 'Este email já está cadastrado';
      throw new Error(errorMsg);
    } finally {
      this._loading.set(false);
    }
  }

  logout(): void {
    this._user.set(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_TOKEN);
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_TOKEN);
  }
}
