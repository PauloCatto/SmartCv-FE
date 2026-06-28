import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth';

import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-register',
  imports: [RouterLink, FormsModule, AsyncPipe],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  auth = inject(AuthService);
  private router = inject(Router);

  name: string = '';
  email: string = '';
  password: string = '';
  error = signal('');
  showPassword = signal(false);

  benefits = [
    '1 currículo gratuito',
    'Preview em tempo real',
    'Exportação em PDF',
  ];

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
