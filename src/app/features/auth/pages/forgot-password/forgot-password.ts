import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth';
import { AsyncPipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, FormsModule, AsyncPipe, TranslateModule],
  templateUrl: './forgot-password.html',
  styleUrl: '../login/login.scss'
})
export class ForgotPassword implements OnInit {
  auth = inject(AuthService);
  private translate = inject(TranslateService);

  email: string = '';
  message = signal<string>('');
  error = signal<string>('');
  submitted = signal<boolean>(false);

  ngOnInit(): void { }

  onSubmit(): void {
    this.submitted.set(true);
    this.error.set('');
    this.message.set('');

    if (!this.email) return;

    this.auth.forgotPassword(this.email).subscribe({
      next: (res: { message: string }) => {
        this.message.set(res.message);
      },
      error: (err: Error) => {
        const isEn: boolean = this.translate.currentLang === 'en';
        this.error.set(err.message || (isEn ? 'Failed to request recovery' : 'Falha ao solicitar recuperação'));
      }
    });
  }
}
