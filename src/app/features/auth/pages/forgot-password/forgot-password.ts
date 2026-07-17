import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth';
import { AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, FormsModule, AsyncPipe, TranslateModule],
  templateUrl: './forgot-password.html',
  styleUrl: '../login/login.scss'
})
export class ForgotPassword implements OnInit {
  auth = inject(AuthService);

  email: string = '';
  message = signal('');
  error = signal('');
  submitted = signal(false);

  ngOnInit() { }

  onSubmit() {
    this.submitted.set(true);
    this.error.set('');
    this.message.set('');

    if (!this.email) return;

    this.auth.forgotPassword(this.email).subscribe({
      next: (res) => {
        this.message.set(res.message);
      },
      error: (err: any) => {
        this.error.set(err.message || 'Falha ao solicitar recuperação');
      }
    });
  }
}
