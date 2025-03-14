import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Skip authentication for these endpoints
  const skipAuth = [
    '/login',
    '/register',
    '/ResetPassword',
    '/verifyCode',
    '/UpdatePassword'
  ].some(endpoint => request.url.includes(endpoint));

  if (skipAuth) {
    return next(request);
  }

  const token = authService.getToken();
  
  if (!token) {
    console.log('No token found, redirecting to login');
    authService.clearSession();
    return throwError(() => new Error('No authentication token'));
  }

  // Clone the request with the token
  request = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  
  return next(request).pipe(
    catchError((error: HttpErrorResponse) => {
      console.log('API Error:', {
        status: error.status,
        message: error.error?.message,
        url: request.url
      });

      if (error.status === 401 || error.status === 403) {
        const errorMessage = error.error?.message?.toLowerCase() || '';
        
        // Handle both token errors and user not found errors
        if (errorMessage.includes('expired') || 
            errorMessage.includes('invalid token') || 
            errorMessage.includes('user not found')) {
          console.log('Auth error detected:', errorMessage);
          authService.clearSession('Your session has expired. Please log in again.');
        }
      }
      return throwError(() => error);
    })
  );
};
