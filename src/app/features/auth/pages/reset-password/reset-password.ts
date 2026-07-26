import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute, Params } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth';
import { AsyncPipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterLink, FormsModule, AsyncPipe, TranslateModule],
  templateUrl: './reset-password.html',
  styleUrl: '../login/login.scss'
})
export class ResetPassword implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private translate = inject(TranslateService);

  token: string = '';
  password: string = '';
  confirmPassword: string = '';
  showPassword = signal<boolean>(false);
  showConfirmPassword = signal<boolean>(false);

  error = signal<string>('');
  message = signal<string>('');
  submitted = signal<boolean>(false);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      const isEn: boolean = this.translate.currentLang === 'en';
      if (params['token']) {
        this.token = params['token'];
      } else {
        this.error.set(isEn ? 'Invalid or missing token.' : 'Token inválido ou ausente.');
      }
    });
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.error.set('');
    this.message.set('');
    const isEn: boolean = this.translate.currentLang === 'en';

    if (!this.token) {
      this.error.set(isEn ? 'Invalid token.' : 'Token inválido.');
      return;
    }

    if (!this.password || !this.confirmPassword) {
      this.error.set(isEn ? 'Please fill in both password fields.' : 'Preencha as senhas.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error.set(isEn ? 'Passwords do not match.' : 'As senhas não coincidem.');
      return;
    }

    if (this.password.length < 6) {
      this.error.set(isEn ? 'Password must be at least 6 characters.' : 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    this.auth.resetPassword(this.token, this.password).subscribe({
      next: (res: { message: string }) => {
        this.message.set(res.message);
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (err: Error) => {
        this.error.set(err.message || (isEn ? 'Failed to reset password' : 'Falha ao redefinir a senha'));
      }
    });
  }
}
