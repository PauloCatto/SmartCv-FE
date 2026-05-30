import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = signal('');
  submitted = signal(false);
  showPassword = signal(false);

  async onSubmit() {
    this.submitted.set(true);
    this.error.set('');

    if (!this.email || !this.password) return;

    try {
      await this.auth.login(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error.set(err.message);
    }
  }

  async loginDemo() {
    this.error.set('');
    try {
      await this.auth.register('Demo User', 'demo@smartcv.com', 'demo123');
    } catch {}
    try {
      await this.auth.login('demo@smartcv.com', 'demo123');
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      this.error.set(err.message);
    }
  }
}
