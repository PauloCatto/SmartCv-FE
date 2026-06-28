import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [RouterLink, AsyncPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  auth = inject(AuthService);
  private router = inject(Router);
  scrolled = signal(false);
  menuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 20);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-menu')) {
      this.menuOpen.set(false);
    }
  }

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  getUserInitials(name: string | undefined): string {
    const userName = name ?? '';
    return userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  logout() {
    this.auth.logout();
    this.menuOpen.set(false);
    this.router.navigate(['/']);
  }
}
