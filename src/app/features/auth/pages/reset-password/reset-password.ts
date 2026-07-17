import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth';
import { AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

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

  token: string = '';
  password: string = '';
  confirmPassword: string = '';
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  error = signal('');
  message = signal('');
  submitted = signal(false);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token = params['token'];
      } else {
        this.error.set('Token inválido ou ausente.');
      }
    });
  }

  onSubmit() {
    this.submitted.set(true);
    this.error.set('');
    this.message.set('');

    if (!this.token) {
      this.error.set('Token inválido.');
      return;
    }

    if (!this.password || !this.confirmPassword) {
      this.error.set('Preencha as senhas.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error.set('As senhas não coincidem.');
      return;
    }

    if (this.password.length < 6) {
      this.error.set('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    this.auth.resetPassword(this.token, this.password).subscribe({
      next: (res) => {
        this.message.set(res.message);
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (err: any) => {
        this.error.set(err.message || 'Falha ao redefinir a senha');
      }
    });
  }
}
