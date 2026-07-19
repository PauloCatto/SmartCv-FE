import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { SidebarService } from '../../core/services/sidebar.service';
import { AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, AsyncPipe, TranslateModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  auth = inject(AuthService);
  sidebarService = inject(SidebarService);
  private router = inject(Router);

  getUserInitials(name: string | undefined): string {
    const userName = name ?? '';
    if (!userName) return 'U';
    return userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  onLinkClick() {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      this.sidebarService.collapse();
    }
  }

  logout() {
    this.onLinkClick();
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
