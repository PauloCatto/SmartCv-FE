import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarComponent } from './sidebar';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AuthService } from '../../core/services/auth';
import { SidebarService } from '../../core/services/sidebar.service';
import { Router } from '@angular/router';
import { signal } from '@angular/core';

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;

  let mockAuthService: any;
  let mockSidebarService: any;

  beforeEach(async () => {
    mockAuthService = {
      logout: vi.fn(),
      user$: of({ name: 'Paulo Catto' })
    };

    mockSidebarService = {
      collapse: vi.fn(),
      toggle: vi.fn(),
      isCollapsed: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [SidebarComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: SidebarService, useValue: mockSidebarService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should extract user initials', () => {
    expect(component.getUserInitials('Paulo Catto')).toBe('PC');
    expect(component.getUserInitials('John')).toBe('J');
    expect(component.getUserInitials(undefined)).toBe('U');
    expect(component.getUserInitials('')).toBe('U');
  });

  it('should collapse sidebar on link click if mobile', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
    component.onLinkClick();
    expect(mockSidebarService.collapse).toHaveBeenCalled();
  });

  it('should not collapse sidebar on link click if desktop', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    component.onLinkClick();
    expect(mockSidebarService.collapse).not.toHaveBeenCalled();
  });

  it('should logout and navigate to home', () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    vi.spyOn(component, 'onLinkClick');

    component.logout();

    expect(component.onLinkClick).toHaveBeenCalled();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
