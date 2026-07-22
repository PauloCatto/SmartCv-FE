import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Register } from './register';
import { AuthService } from '../../../../core/services/auth';
import { SocialAuthService } from '@abacritt/angularx-social-login';
import { provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

describe('Register', () => {
  let component: Register;
  let fixture: ComponentFixture<Register>;
  let mockAuthService: any;
  let mockSocialAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      register: vi.fn(),
      googleLogin: vi.fn()
    };

    mockSocialAuthService = {
      authState: new BehaviorSubject(null),
      initState: new BehaviorSubject(true)
    };

    await TestBed.configureTestingModule({
      imports: [Register, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: SocialAuthService, useValue: mockSocialAuthService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate password strength correctly', () => {
    component.password = '123';
    expect(component.passwordStrength()).toBe(1);
    expect(component.strengthLabel()).toBe('Fraca');

    component.password = '123456';
    expect(component.passwordStrength()).toBe(2);
    expect(component.strengthLabel()).toBe('Razoável');

    component.password = '123456A';
    expect(component.passwordStrength()).toBe(3);
    expect(component.strengthLabel()).toBe('Boa');

    component.password = '123456A!';
    expect(component.passwordStrength()).toBe(4);
    expect(component.strengthLabel()).toBe('Forte');
  });

  it('should not call register if fields are empty', () => {
    component.name = '';
    component.onSubmit();
    expect(component.error()).toBe('Preencha todos os campos');
    expect(mockAuthService.register).not.toHaveBeenCalled();
  });

  it('should not call register if password is too short', () => {
    component.name = 'Test';
    component.email = 'test@example.com';
    component.password = '123';
    component.onSubmit();
    expect(component.error()).toBe('A senha deve ter pelo menos 6 caracteres');
    expect(mockAuthService.register).not.toHaveBeenCalled();
  });

  it('should call register and navigate on success', () => {
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    mockAuthService.register.mockReturnValue(of({}));
    
    component.name = 'Test';
    component.email = 'test@example.com';
    component.password = '123456';
    component.onSubmit();
    
    expect(mockAuthService.register).toHaveBeenCalledWith('Test', 'test@example.com', '123456');
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should handle register error', () => {
    mockAuthService.register.mockReturnValue(throwError(() => new Error('Email já em uso')));
    
    component.name = 'Test';
    component.email = 'test@example.com';
    component.password = '123456';
    component.onSubmit();
    
    expect(component.error()).toBe('Email já em uso');
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
