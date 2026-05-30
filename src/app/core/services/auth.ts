import { Injectable, signal, computed } from '@angular/core';
import { User } from '../models/resume.model';

const STORAGE_KEY = 'smartcv_user';
const STORAGE_TOKEN = 'smartcv_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(this.loadUser());
  private _loading = signal(false);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  private loadUser(): User | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  login(email: string, password: string): Promise<void> {
    this._loading.set(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Mock validation
        const stored = localStorage.getItem(`smartcv_user_${email}`);
        if (stored) {
          const userData = JSON.parse(stored);
          if (userData.password === btoa(password)) {
            const user: User = { id: userData.id, name: userData.name, email: userData.email, plan: userData.plan };
            this._user.set(user);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
            localStorage.setItem(STORAGE_TOKEN, 'mock-jwt-token');
            this._loading.set(false);
            resolve();
          } else {
            this._loading.set(false);
            reject(new Error('Email ou senha inválidos'));
          }
        } else {
          this._loading.set(false);
          reject(new Error('Usuário não encontrado'));
        }
      }, 1000);
    });
  }

  register(name: string, email: string, password: string): Promise<void> {
    this._loading.set(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const exists = localStorage.getItem(`smartcv_user_${email}`);
        if (exists) {
          this._loading.set(false);
          reject(new Error('Este email já está cadastrado'));
          return;
        }
        const user: User = {
          id: crypto.randomUUID(),
          name,
          email,
          plan: 'free',
        };
        // Store with password for mock auth
        localStorage.setItem(`smartcv_user_${email}`, JSON.stringify({ ...user, password: btoa(password) }));
        this._user.set(user);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        localStorage.setItem(STORAGE_TOKEN, 'mock-jwt-token');
        this._loading.set(false);
        resolve();
      }, 1000);
    });
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
