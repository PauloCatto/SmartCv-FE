import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetPassword } from './reset-password';
import { AuthService } from '../../../../core/services/auth';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
describe('ResetPassword', () => {
  let component: ResetPassword;
  let fixture: ComponentFixture<ResetPassword>;
  let mockAuthService: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    mockAuthService = {
      resetPassword: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ResetPassword, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: { queryParams: of({ token: 'test-token' }) } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set token from queryParams on init', () => {
    expect(component.token).toBe('test-token');
  });

  it('should not call resetPassword if token is invalid', () => {
    component.token = '';
    component.onSubmit();
    expect(component.error()).toBe('Token inválido.');
    expect(mockAuthService.resetPassword).not.toHaveBeenCalled();
  });

  it('should not call resetPassword if passwords are missing', () => {
    component.password = '';
    component.confirmPassword = '';
    component.onSubmit();
    expect(component.error()).toBe('Preencha as senhas.');
    expect(mockAuthService.resetPassword).not.toHaveBeenCalled();
  });

  it('should not call resetPassword if passwords do not match', () => {
    component.password = '123456';
    component.confirmPassword = '1234567';
    component.onSubmit();
    expect(component.error()).toBe('As senhas não coincidem.');
    expect(mockAuthService.resetPassword).not.toHaveBeenCalled();
  });

  it('should not call resetPassword if password is too short', () => {
    component.password = '12345';
    component.confirmPassword = '12345';
    component.onSubmit();
    expect(component.error()).toBe('A senha deve ter pelo menos 6 caracteres.');
    expect(mockAuthService.resetPassword).not.toHaveBeenCalled();
  });

  it('should call resetPassword and navigate on success', () => {
    vi.useFakeTimers();
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');
    mockAuthService.resetPassword.mockReturnValue(of({ message: 'Senha redefinida' }));
    
    component.password = '123456';
    component.confirmPassword = '123456';
    component.onSubmit();
    
    expect(mockAuthService.resetPassword).toHaveBeenCalledWith('test-token', '123456');
    expect(component.message()).toBe('Senha redefinida');
    
    vi.advanceTimersByTime(2000);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
    vi.useRealTimers();
  });

  it('should handle resetPassword error', () => {
    mockAuthService.resetPassword.mockReturnValue(throwError(() => new Error('Token expirado')));
    
    component.password = '123456';
    component.confirmPassword = '123456';
    component.onSubmit();
    
    expect(component.error()).toBe('Token expirado');
  });
});
