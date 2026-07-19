import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, AsyncPipe, UpperCasePipe, TranslateModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  auth = inject(AuthService);
  translate = inject(TranslateService);
  sidebarService = inject(SidebarService);
  private router = inject(Router);
  scrolled = signal(false);
  menuOpen = signal(false);
  langMenuOpen = signal(false);

  currentLang = signal(this.translate.currentLang || 'pt');

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
    if (!target.closest('.lang-switcher')) {
      this.langMenuOpen.set(false);
    }
  }

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }

  toggleLangMenu() {
    this.langMenuOpen.update(v => !v);
  }

  switchLang(lang: string) {
    this.translate.use(lang);
    this.currentLang.set(lang);
    localStorage.setItem('smartcv_lang', lang);
    this.langMenuOpen.set(false);
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

  scrollTo(id: string) {
    if (this.router.url !== '/' && !this.router.url.startsWith('/#')) {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      });
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
