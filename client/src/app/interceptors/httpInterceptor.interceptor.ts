import { HttpInterceptorFn } from '@angular/common/http';
import {
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, switchMap, catchError, from } from 'rxjs';
import { environment } from '../environments/environment';

const refreshToken = (): Observable<any> => {
  return from(
    fetch(`${environment.apiUrl}/auth/refresh`, {
      method: 'GET',
      credentials: 'include',
    }).then((response) => response.json())
  );
};

export const httpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<any>> => {
  const apiUrl = environment.apiUrl;
  const clonedReq = req.clone({
    url: `${apiUrl}/${req.url}`,
    withCredentials: true,
  });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return refreshToken().pipe(
          switchMap((refreshResponse: any) => {
            if (refreshResponse.message === 'Tokens refreshed') {
              const retryReq = req.clone({
                url: `${apiUrl}/${req.url}`,
                withCredentials: true,
              });
              return next(retryReq);
            } else {
              console.error('Failed to refresh token');
              window.location.href = 'http://localhost:4200/login';
              return throwError(() => new Error('Failed to refresh token'));
            }
          }),
          catchError((refreshError) => {
            console.error('Refresh failed', refreshError);
            return throwError(() => new Error('Refresh failed'));
          })
        );
      }
      return throwError(() => error);
    })
  );
};
