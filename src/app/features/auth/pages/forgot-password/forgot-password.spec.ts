import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPassword } from './forgot-password';
import { AuthService } from '../../../../core/services/auth';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
describe('ForgotPassword', () => {
  let component: ForgotPassword;
  let fixture: ComponentFixture<ForgotPassword>;
  let mockAuthService: Record<string, ReturnType<typeof vi.fn>>;

  beforeEach(async () => {
    mockAuthService = {
      forgotPassword: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ForgotPassword, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForgotPassword);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call forgotPassword if email is empty', () => {
    component.email = '';
    component.onSubmit();
    expect(component.submitted()).toBe(true);
    expect(mockAuthService.forgotPassword).not.toHaveBeenCalled();
  });

  it('should call forgotPassword and set message on success', () => {
    mockAuthService.forgotPassword.mockReturnValue(of({ message: 'Email enviado com sucesso' }));
    
    component.email = 'test@example.com';
    component.onSubmit();
    
    expect(mockAuthService.forgotPassword).toHaveBeenCalledWith('test@example.com');
    expect(component.message()).toBe('Email enviado com sucesso');
    expect(component.error()).toBe('');
  });

  it('should handle error when forgotPassword fails', () => {
    mockAuthService.forgotPassword.mockReturnValue(throwError(() => new Error('Usuário não encontrado')));
    
    component.email = 'test@example.com';
    component.onSubmit();
    
    expect(mockAuthService.forgotPassword).toHaveBeenCalledWith('test@example.com');
    expect(component.error()).toBe('Usuário não encontrado');
    expect(component.message()).toBe('');
  });
});
