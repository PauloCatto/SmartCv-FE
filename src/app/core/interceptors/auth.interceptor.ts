import { HttpInterceptorFn, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('smartcv_token');

  if (token && req.url.startsWith(environment.apiUrl)) {
    const cloned = req.clone({
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    });
    return next(cloned);
  }

  return next(req);
};
