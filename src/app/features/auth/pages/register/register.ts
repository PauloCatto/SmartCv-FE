import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth';
import { SocialAuthService, GoogleSigninButtonModule, SocialUser } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule, AsyncPipe, TranslateModule, GoogleSigninButtonModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private router = inject(Router);
  private socialAuthService = inject(SocialAuthService);
  private translate = inject(TranslateService);

  name: string = '';
  email: string = '';
  password: string = '';
  error = signal<string>('');
  showPassword = signal<boolean>(false);
  authSubscription!: Subscription;

  benefits: string[] = [
    'AUTH.REGISTER.BENEFITS.0',
    'AUTH.REGISTER.BENEFITS.1',
    'AUTH.REGISTER.BENEFITS.2',
    'AUTH.REGISTER.BENEFITS.3',
    'AUTH.REGISTER.BENEFITS.4'
  ];

  ngOnInit(): void {
    this.authSubscription = this.socialAuthService.authState.subscribe((user: SocialUser | null) => {
      if (user && user.idToken) {
        this.auth.googleLogin(user.idToken).subscribe({
          next: () => {
            this.router.navigate(['/dashboard']);
          },
          error: (err: Error) => {
            const isEn = this.translate.currentLang === 'en';
            this.error.set(err.message || (isEn ? 'Google signup failed' : 'Falha no cadastro com Google'));
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

  passwordStrength(): number {
    let s = 0;
    if (this.password.length >= 6) s++;
    if (this.password.match(/[A-Z]/)) s++;
    if (this.password.match(/[0-9]/)) s++;
    if (this.password.match(/[^a-zA-Z0-9]/)) s++;
    return s;
  }

  strengthLabel(): string {
    const isEn: boolean = this.translate.currentLang === 'en';
    const s: number = this.passwordStrength();
    if (s <= 1) return isEn ? 'Weak' : 'Fraca';
    if (s === 2) return isEn ? 'Fair' : 'Razoável';
    if (s === 3) return isEn ? 'Good' : 'Boa';
    return isEn ? 'Strong' : 'Forte';
  }

  onSubmit(): void {
    this.error.set('');
    const isEn: boolean = this.translate.currentLang === 'en';

    if (!this.name || !this.email || !this.password) {
      this.error.set(isEn ? 'Please fill in all fields' : 'Preencha todos os campos');
      return;
    }
    if (this.password.length < 6) {
      this.error.set(isEn ? 'Password must be at least 6 characters' : 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: Error) => {
        this.error.set(err.message || (isEn ? 'Registration failed' : 'Falha no cadastro'));
      }
    });
  }
}
