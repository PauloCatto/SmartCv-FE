import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header';
import { AuthService } from '../../core/services/auth';
import { TranslateModule } from '@ngx-translate/core';
import { SidebarService } from '../../core/services/sidebar.service';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { Router } from '@angular/router';
describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockAuthService: any;
  let mockSidebarService: any;

  beforeEach(async () => {
    mockAuthService = {
      isAuthenticated$: new BehaviorSubject<boolean>(false),
      user$: new BehaviorSubject<any>(null),
      logout: vi.fn()
    };

    mockSidebarService = {};

    await TestBed.configureTestingModule({
      imports: [HeaderComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: SidebarService, useValue: mockSidebarService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should extract user initials correctly', () => {
    expect(component.getUserInitials('Paulo Catto')).toBe('PC');
    expect(component.getUserInitials('John')).toBe('J');
    expect(component.getUserInitials(undefined)).toBe('');
  });

  it('should set scrolled on scroll', () => {
    Object.defineProperty(window, 'scrollY', { value: 30, writable: true });
    component.onScroll();
    expect(component.scrolled()).toBe(true);

    Object.defineProperty(window, 'scrollY', { value: 10, writable: true });
    component.onScroll();
    expect(component.scrolled()).toBe(false);
  });

  it('should toggle menu', () => {
    expect(component.menuOpen()).toBe(false);
    component.toggleMenu();
    expect(component.menuOpen()).toBe(true);
  });

  it('should toggle lang menu', () => {
    expect(component.langMenuOpen()).toBe(false);
    component.toggleLangMenu();
    expect(component.langMenuOpen()).toBe(true);
  });

  it('should switch lang', () => {
    vi.spyOn(Storage.prototype, 'setItem');
    component.switchLang('en');
    expect(component.currentLang()).toBe('en');
    expect(localStorage.setItem).toHaveBeenCalledWith('smartcv_lang', 'en');
    expect(component.langMenuOpen()).toBe(false);
  });

  it('should close menus on outside click', () => {
    component.menuOpen.set(true);
    component.langMenuOpen.set(true);

    const event = { target: { closest: () => false } } as any;
    component.onDocumentClick(event);

    expect(component.menuOpen()).toBe(false);
    expect(component.langMenuOpen()).toBe(false);
  });

  it('should logout and navigate', () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    
    component.menuOpen.set(true);
    component.logout();
    
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(component.menuOpen()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should scroll to element when on home route', () => {
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

  it('should navigate to home and scroll to element if not on home route', async () => {
    vi.useFakeTimers();
    const router = TestBed.inject(Router);
    Object.defineProperty(router, 'url', { get: () => '/other' });
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    
    const mockElement = { scrollIntoView: vi.fn() };
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement as any);
    
    component.scrollTo('test-id');
    
    await Promise.resolve(); // wait for router promise
    vi.advanceTimersByTime(150); // wait for setTimeout
    
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(document.getElementById).toHaveBeenCalledWith('test-id');
    expect(mockElement.scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
    vi.useRealTimers();
  });
});
