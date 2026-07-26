import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth';
import { SocialAuthService, GoogleSigninButtonModule, SocialUser } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, AsyncPipe, TranslateModule, GoogleSigninButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private router = inject(Router);
  private socialAuthService = inject(SocialAuthService);
  private translate = inject(TranslateService);

  email: string = '';
  password: string = '';
  error = signal<string>('');
  submitted = signal<boolean>(false);
  showPassword = signal<boolean>(false);
  authSubscription!: Subscription;

  ngOnInit(): void {
    this.authSubscription = this.socialAuthService.authState.subscribe((user: SocialUser | null) => {
      if (user && user.idToken) {
        this.auth.googleLogin(user.idToken).subscribe({
          next: () => {
            this.router.navigate(['/dashboard']);
          },
          error: (err: Error) => {
            const isEn = this.translate.currentLang === 'en';
            this.error.set(err.message || (isEn ? 'Google login failed' : 'Falha no login com Google'));
          }
        });
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  onSubmit(): void {
    this.submitted.set(true);
    this.error.set('');

    if (!this.email || !this.password) return;

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: Error) => {
        const isEn = this.translate.currentLang === 'en';
        this.error.set(err.message || (isEn ? 'Login failed' : 'Falha no login'));
      }
    });
  }
}
