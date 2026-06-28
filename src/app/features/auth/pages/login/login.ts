import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth';

import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, AsyncPipe],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  auth = inject(AuthService);
  private router = inject(Router);

  email: string = '';
  password: string = '';
  error = signal('');
  submitted = signal(false);
  showPassword = signal(false);

  onSubmit() {
    this.submitted.set(true);
    this.error.set('');

    if (!this.email || !this.password) return;

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.error.set(err.message || 'Falha no login');
      }
    });
  }

  loginDemo() {
    this.error.set('');
    this.auth.register('Demo User', 'demo@smartcv.com', 'demo123').subscribe({
      next: () => {
        this.doDemoLogin();
      },
      error: () => {
        this.doDemoLogin();
      }
    });
  }

  private doDemoLogin() {
    this.auth.login('demo@smartcv.com', 'demo123').subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.error.set(err.message || 'Falha no login da conta Demo');
      }
    });
  }
}
