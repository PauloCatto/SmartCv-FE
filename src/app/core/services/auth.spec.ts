import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const mockUser = { id: '1', name: 'Test', email: 'test@test.com', plan: 'free' };
  const mockAuthResponse = { user: mockUser, token: 'fake-token' };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should login and set user/token', () => {
    service.login('test@test.com', 'password').subscribe(res => {
      expect(res.token).toBe('fake-token');
      expect(service.currentUserValue?.name).toBe('Test');
      expect(localStorage.getItem('smartcv_token')).toBe('fake-token');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockAuthResponse);
  });

  it('should clear loading on login error', () => {
    service.login('test@test.com', 'bad').subscribe({ error: () => {} });
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush('Error', { status: 401, statusText: 'Unauthorized' });
  });

  it('should register and set user/token', () => {
    service.register('Test', 'test@test.com', 'password').subscribe(res => {
      expect(res.token).toBe('fake-token');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    req.flush(mockAuthResponse);
  });

  it('should clear loading on register error', () => {
    service.register('Test', 'test@test.com', 'bad').subscribe({ error: () => {} });
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    req.flush('Error', { status: 400, statusText: 'Bad Request' });
  });

  it('should login with google and set user/token', () => {
    service.googleLogin('google-token').subscribe(res => {
      expect(res.token).toBe('fake-token');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/google`);
    expect(req.request.method).toBe('POST');
    req.flush(mockAuthResponse);
  });

  it('should clear loading on google login error', () => {
    service.googleLogin('bad-token').subscribe({ error: () => {} });
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/google`);
    req.flush('Error', { status: 401, statusText: 'Unauthorized' });
  });

  it('should change password', () => {
    service.changePassword('newPass', 'oldPass').subscribe(res => {
      expect(res.message).toBe('success');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/change-password`);
    req.flush({ message: 'success' });
  });

  it('should handle change password error', () => {
    service.changePassword('newPass', 'badPass').subscribe({ error: () => {} });
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/change-password`);
    req.flush('Error', { status: 400, statusText: 'Bad Request' });
  });

  it('should request forgot password', () => {
    service.forgotPassword('test@test.com').subscribe(res => {
      expect(res.message).toBe('success');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/forgot-password`);
    req.flush({ message: 'success' });
  });

  it('should handle forgot password error', () => {
    service.forgotPassword('test@test.com').subscribe({ error: () => {} });
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/forgot-password`);
    req.flush('Error', { status: 400, statusText: 'Bad Request' });
  });

  it('should reset password', () => {
    service.resetPassword('token', 'newPass').subscribe(res => {
      expect(res.message).toBe('success');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/reset-password`);
    req.flush({ message: 'success' });
  });

  it('should handle reset password error', () => {
    service.resetPassword('bad-token', 'newPass').subscribe({ error: () => {} });
    const req = httpMock.expectOne(`${environment.apiUrl}/auth/reset-password`);
    req.flush('Error', { status: 400, statusText: 'Bad Request' });
  });

  it('should logout and remove tokens', () => {
    localStorage.setItem('smartcv_token', 'token');
    localStorage.setItem('smartcv_user', '{}');
    
    service.logout();
    
    expect(localStorage.getItem('smartcv_token')).toBeNull();
    expect(localStorage.getItem('smartcv_user')).toBeNull();
    expect(service.currentUserValue).toBeNull();
  });
});
