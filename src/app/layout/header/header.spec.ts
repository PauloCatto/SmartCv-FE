import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header';
import { AuthService } from '../../core/services/auth';
import { TranslateModule } from '@ngx-translate/core';
import { SidebarService } from '../../core/services/sidebar.service';
import { provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockAuthService: any;
  let mockSidebarService: any;

  const createFixture = async (isAuthenticated: boolean, user: any = null) => {
    mockAuthService = {
      isAuthenticated$: new BehaviorSubject<boolean>(isAuthenticated),
      user$: new BehaviorSubject<any>(user),
      logout: vi.fn()
    };
    mockSidebarService = { toggle: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([
          { path: '', component: HeaderComponent },
          { path: 'dashboard', component: HeaderComponent },
          { path: 'ai/cover-letter', component: HeaderComponent },
          { path: 'ai/roast', component: HeaderComponent },
          { path: 'auth/login', component: HeaderComponent },
          { path: 'auth/register', component: HeaderComponent },
        ]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: SidebarService, useValue: mockSidebarService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create (unauthenticated)', async () => {
    await createFixture(false);
    expect(component).toBeTruthy();
  });

  it('should render login/register links when not authenticated', async () => {
    await createFixture(false);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('a[routerLink="/auth/login"]')).toBeTruthy();
    expect(compiled.querySelector('a[routerLink="/auth/register"]')).toBeTruthy();
    expect(compiled.querySelector('.navbar-links')).toBeTruthy();
  });

  it('should render authenticated layout with user avatar', async () => {
    await createFixture(true, { name: 'Paulo Catto', email: 'paulo@test.com' });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.hamburger-menu-btn')).toBeTruthy();
    expect(compiled.querySelector('.user-avatar')).toBeTruthy();
    expect(compiled.querySelector('.navbar-links')).toBeFalsy();
  });

  it('should show dropdown menu when menuOpen is true (authenticated)', async () => {
    await createFixture(true, { name: 'Paulo Catto', email: 'paulo@test.com' });
    component.menuOpen.set(true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.dropdown-menu')).toBeTruthy();
    expect(compiled.querySelector('.dropdown-name')?.textContent).toContain('Paulo Catto');
    expect(compiled.querySelector('.dropdown-email')?.textContent).toContain('paulo@test.com');
  });

  it('should show lang dropdown when langMenuOpen is true with pt selected', async () => {
    await createFixture(false);
    component.currentLang.set('pt');
    component.langMenuOpen.set(true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.lang-dropdown')).toBeTruthy();
    const ptBtn = compiled.querySelector('.lang-option:first-child') as HTMLElement;
    expect(ptBtn?.classList).toContain('active');
    expect(compiled.querySelectorAll('svg.lang-check').length).toBeGreaterThan(0);
  });

  it('should show lang dropdown with en selected check icon', async () => {
    await createFixture(false);
    component.currentLang.set('en');
    component.langMenuOpen.set(true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const enBtn = compiled.querySelector('.lang-option:last-child') as HTMLElement;
    expect(enBtn?.classList).toContain('active');
    expect(compiled.querySelectorAll('svg.lang-check').length).toBeGreaterThan(0);
  });

  it('should call sidebarService.toggle when hamburger button is clicked', async () => {
    await createFixture(true, { name: 'Test User', email: 't@t.com' });
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('.hamburger-menu-btn') as HTMLElement;
    btn?.click();
    expect(mockSidebarService.toggle).toHaveBeenCalled();
  });

  it('should close dropdown items when clicking dashboard link', async () => {
    await createFixture(true, { name: 'Test User', email: 't@t.com' });
    component.menuOpen.set(true);
    fixture.detectChanges();
    const dashboardLink = fixture.nativeElement.querySelector('a[routerLink="/dashboard"]') as HTMLElement;
    dashboardLink?.click();
    fixture.detectChanges();
    expect(component.menuOpen()).toBe(false);
  });

  it('should close dropdown items when clicking cover-letter link', async () => {
    await createFixture(true, { name: 'Test User', email: 't@t.com' });
    component.menuOpen.set(true);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a[routerLink="/ai/cover-letter"]') as HTMLElement;
    link?.click();
    fixture.detectChanges();
    expect(component.menuOpen()).toBe(false);
  });

  it('should close dropdown items when clicking roast link', async () => {
    await createFixture(true, { name: 'Test User', email: 't@t.com' });
    component.menuOpen.set(true);
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a[routerLink="/ai/roast"]') as HTMLElement;
    link?.click();
    fixture.detectChanges();
    expect(component.menuOpen()).toBe(false);
  });

  it('should extract user initials correctly', async () => {
    await createFixture(false);
    expect(component.getUserInitials('Paulo Catto')).toBe('PC');
    expect(component.getUserInitials('John')).toBe('J');
    expect(component.getUserInitials(undefined)).toBe('');
  });

  it('should set scrolled on scroll', async () => {
    await createFixture(false);
    Object.defineProperty(window, 'scrollY', { value: 30, writable: true });
    component.onScroll();
    expect(component.scrolled()).toBe(true);

    Object.defineProperty(window, 'scrollY', { value: 10, writable: true });
    component.onScroll();
    expect(component.scrolled()).toBe(false);
  });

  it('should update scrolled class on nav element', async () => {
    await createFixture(false);
    Object.defineProperty(window, 'scrollY', { value: 30, writable: true });
    component.onScroll();
    fixture.detectChanges();
    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    expect(nav.classList).toContain('scrolled');
  });

  it('should toggle menu', async () => {
    await createFixture(false);
    expect(component.menuOpen()).toBe(false);
    component.toggleMenu();
    expect(component.menuOpen()).toBe(true);
    component.toggleMenu();
    expect(component.menuOpen()).toBe(false);
  });

  it('should toggle lang menu', async () => {
    await createFixture(false);
    expect(component.langMenuOpen()).toBe(false);
    component.toggleLangMenu();
    expect(component.langMenuOpen()).toBe(true);
    component.toggleLangMenu();
    expect(component.langMenuOpen()).toBe(false);
  });

  it('should switch lang', async () => {
    await createFixture(false);
    vi.spyOn(Storage.prototype, 'setItem');
    component.switchLang('en');
    expect(component.currentLang()).toBe('en');
    expect(localStorage.setItem).toHaveBeenCalledWith('smartcv_lang', 'en');
    expect(component.langMenuOpen()).toBe(false);
  });

  it('should close menus on outside click', async () => {
    await createFixture(false);
    component.menuOpen.set(true);
    component.langMenuOpen.set(true);

    const event = { target: { closest: () => false } } as any;
    component.onDocumentClick(event);

    expect(component.menuOpen()).toBe(false);
    expect(component.langMenuOpen()).toBe(false);
  });

  it('should not close menus if clicking inside', async () => {
    await createFixture(false);
    component.menuOpen.set(true);
    component.langMenuOpen.set(true);

    const event = { target: { closest: (selector: string) => true } } as any;
    component.onDocumentClick(event);

    expect(component.menuOpen()).toBe(true);
    expect(component.langMenuOpen()).toBe(true);
  });

  it('should logout and navigate', async () => {
    await createFixture(true, { name: 'Test', email: 't@t.com' });
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

    component.menuOpen.set(true);
    component.logout();

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(component.menuOpen()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should scroll to element when on home route', async () => {
    await createFixture(false);
    vi.useFakeTimers();
    const router = TestBed.inject(Router);
    Object.defineProperty(router, 'url', { get: () => '/' });

    const mockElement = { scrollIntoView: vi.fn() };
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);

    component.scrollTo('test-id');

    expect(document.getElementById).toHaveBeenCalledWith('test-id');
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    vi.useRealTimers();
  });

  it('should not scroll if element is not found on home route', async () => {
    await createFixture(false);
    vi.useFakeTimers();
    const router = TestBed.inject(Router);
    Object.defineProperty(router, 'url', { get: () => '/' });

    vi.spyOn(document, 'getElementById').mockReturnValue(null);

    component.scrollTo('test-id');

    expect(document.getElementById).toHaveBeenCalledWith('test-id');
    vi.useRealTimers();
  });

  it('should not navigate if already on a fragment route /#', async () => {
    await createFixture(false);
    vi.useFakeTimers();
    const router = TestBed.inject(Router);
    Object.defineProperty(router, 'url', { get: () => '/#some-fragment' });
    vi.spyOn(router, 'navigate');

    const mockElement = { scrollIntoView: vi.fn() };
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);

    component.scrollTo('test-id');

    expect(router.navigate).not.toHaveBeenCalled();
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    vi.useRealTimers();
  });

  it('should navigate to home and scroll to element if not on home route', async () => {
    await createFixture(false);
    vi.useFakeTimers();
    const router = TestBed.inject(Router);
    Object.defineProperty(router, 'url', { get: () => '/other' });
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    const mockElement = { scrollIntoView: vi.fn() };
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);

    component.scrollTo('test-id');

    await Promise.resolve();
    vi.advanceTimersByTime(150);

    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(document.getElementById).toHaveBeenCalledWith('test-id');
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    vi.useRealTimers();
  });

  it('should handle navigate to home and scroll to element not found', async () => {
    await createFixture(false);
    vi.useFakeTimers();
    const router = TestBed.inject(Router);
    Object.defineProperty(router, 'url', { get: () => '/other' });
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    vi.spyOn(document, 'getElementById').mockReturnValue(null);

    component.scrollTo('test-id');

    await Promise.resolve();
    vi.advanceTimersByTime(150);

    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(document.getElementById).toHaveBeenCalledWith('test-id');
    vi.useRealTimers();
  });
});
