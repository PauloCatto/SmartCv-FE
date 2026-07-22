import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Login } from './login';
import { AuthService } from '../../../../core/services/auth';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let mockAuthService: any;
  let mockSocialAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      login: vi.fn(),
      googleLogin: vi.fn()
    };

    mockSocialAuthService = {
      authState: new BehaviorSubject(null),
      initState: new BehaviorSubject(true)
    };

    await TestBed.configureTestingModule({
      imports: [Login, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: SocialAuthService, useValue: mockSocialAuthService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call login if email or password are empty', () => {
    component.email = '';
    component.password = '';
    component.onSubmit();
    expect(component.submitted()).toBe(true);
    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('should call login and navigate on success', () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    mockAuthService.login.mockReturnValue(of({}));
    
    component.email = 'test@example.com';
    component.password = 'password';
    component.onSubmit();
    
    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle login error', () => {
    mockAuthService.login.mockReturnValue(throwError(() => new Error('Credenciais inválidas')));
    
    component.email = 'test@example.com';
    component.password = 'password';
    component.onSubmit();
    
    expect(component.error()).toBe('Credenciais inválidas');
  });

  it('should call googleLogin and navigate when social auth state emits user', () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    mockAuthService.googleLogin.mockReturnValue(of({}));
    
    mockSocialAuthService.authState.next({ idToken: 'fake-token' });
    
    expect(mockAuthService.googleLogin).toHaveBeenCalledWith('fake-token');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle googleLogin error', () => {
    mockAuthService.googleLogin.mockReturnValue(throwError(() => new Error('Google error')));
    
    mockSocialAuthService.authState.next({ idToken: 'fake-token' });
    
    expect(component.error()).toBe('Google error');
  });
});
