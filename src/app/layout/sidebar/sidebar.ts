import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, AsyncPipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  getUserInitials(name: string | undefined): string {
    const userName = name ?? '';
    if (!userName) return 'U';
    return userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
