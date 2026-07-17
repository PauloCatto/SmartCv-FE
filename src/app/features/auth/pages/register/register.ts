import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth';
import { SocialAuthService, GoogleSigninButtonModule } from '@abacritt/angularx-social-login';
import { Subscription } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule, AsyncPipe, GoogleSigninButtonModule, TranslateModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register implements OnInit, OnDestroy {
  auth = inject(AuthService);
  private router = inject(Router);
  private socialAuthService = inject(SocialAuthService);

  name: string = '';
  email: string = '';
  password: string = '';
  error = signal('');
  showPassword = signal(false);
  authSubscription!: Subscription;

  benefits = [
    'AUTH.REGISTER.BENEFITS.0',
    'AUTH.REGISTER.BENEFITS.1',
    'AUTH.REGISTER.BENEFITS.2',
    'AUTH.REGISTER.BENEFITS.3',
    'AUTH.REGISTER.BENEFITS.4'
  ];

  ngOnInit() {
    this.authSubscription = this.socialAuthService.authState.subscribe((user) => {
      if (user && user.idToken) {
        this.auth.googleLogin(user.idToken as string).subscribe({
          next: () => {
            this.router.navigate(['/dashboard']);
          },
          error: (err: any) => {
            this.error.set(err.message || 'Falha no cadastro com Google');
          }
        });
      }
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  passwordStrength() {
    let s = 0;
    if (this.password.length >= 6) s++;
    if (this.password.match(/[A-Z]/)) s++;
    if (this.password.match(/[0-9]/)) s++;
    if (this.password.match(/[^a-zA-Z0-9]/)) s++;
    return s;
  }

  strengthLabel() {
    const s = this.passwordStrength();
    if (s <= 1) return 'Fraca';
    if (s === 2) return 'Razoável';
    if (s === 3) return 'Boa';
    return 'Forte';
  }

  onSubmit() {
    this.error.set('');
    if (!this.name || !this.email || !this.password) {
      this.error.set('Preencha todos os campos');
      return;
    }
    if (this.password.length < 6) {
      this.error.set('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.error.set(err.message || 'Falha no cadastro');
      }
    });
  }
}
