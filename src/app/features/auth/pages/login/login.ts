import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth';
import { SocialAuthService, GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, AsyncPipe, TranslateModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private router = inject(Router);
  private socialAuthService = inject(SocialAuthService);

  email: string = '';
  password: string = '';
  error = signal('');
  submitted = signal(false);
  showPassword = signal(false);
  authSubscription!: Subscription;

  private isInitializing: boolean = true;

  ngOnInit(): void {
    this.authSubscription = this.socialAuthService.authState.subscribe((user) => {
      if (this.isInitializing) {
        // Ignora a emissão automática na inicialização do componente
        this.isInitializing = false;
        return;
      }

      if (user && user.idToken) {
        this.auth.googleLogin(user.idToken as string).subscribe({
          next: () => {
            this.router.navigate(['/dashboard']);
          },
          error: (err: Error) => {
            this.error.set(err.message || 'Falha no login com Google');
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

  signInWithGoogle(): void {
    this.isInitializing = false;
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
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
        this.error.set(err.message || 'Falha no login');
      }
    });
  }
}
