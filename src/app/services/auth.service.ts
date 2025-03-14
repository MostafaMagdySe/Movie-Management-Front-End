import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { NotificationService } from './notification.service';
import { UserProvidedCodeResponse, UserNewPasswordRequest, ResetPasswordResponse } from '../shared/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private tokenKey = 'token';
  private roleKey = 'role';
  
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  
  isLoggedIn$ = this.isLoggedInSubject.asObservable();
  isAdmin$ = this.isAdminSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private notificationService: NotificationService
  ) {
    // Initialize state based on token immediately
    const token = this.getToken();
    if (token && this.isTokenValid(token)) {
      const decodedToken = this.decodeToken(token);
      const role = this.getRoleFromToken(decodedToken);
      this.isLoggedInSubject.next(true);
      this.isAdminSubject.next(role === 'Admin');
      
      // If at root or login page, redirect to dashboard
      const currentUrl = this.router.url;
      if (currentUrl === '/' || currentUrl === '/login') {
        this.router.navigate(['/user-dashboard']);
      }
    } else if (!this.isAuthPage()) {
      // If not logged in and not on auth page, redirect to login
      this.router.navigate(['/login']);
    }
    
    // Then check auth state with server
    this.checkAuthState();
  }

  private isAuthPage(): boolean {
    const currentUrl = this.router.url;
    return currentUrl === '/login' || 
           currentUrl === '/register' || 
           currentUrl === '/reset-password';
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private checkAuthState(): void {
    const token = this.getToken();
    console.log('Checking auth state with token:', token ? 'exists' : 'none');
    
    if (!token) {
      console.log('No token found, clearing session');
      this.clearSession();
      return;
    }

    // First try to decode and validate the token locally
    const decodedToken = this.decodeToken(token);
    if (decodedToken) {
      const expirationDate = new Date(decodedToken.exp * 1000);
      const currentDate = new Date();
      
      if (expirationDate > currentDate) {
        console.log('Token is valid locally, setting logged in state');
        const role = this.getRoleFromToken(decodedToken);
        this.isLoggedInSubject.next(true);
        this.isAdminSubject.next(role === 'Admin');
        return;
      } else {
        console.log('Token is expired, clearing session');
        this.clearSession('Your session has expired. Please log in again.');
        return;
      }
    }

    // If we can't decode the token, try to validate with server
    console.log('Validating token with server');
    this.validateToken(token).subscribe({
      next: (isValid) => {
        if (isValid) {
          console.log('Server validated token, setting logged in state');
          const decodedToken = this.decodeToken(token);
          if (decodedToken) {
            const role = this.getRoleFromToken(decodedToken);
            this.isLoggedInSubject.next(true);
            this.isAdminSubject.next(role === 'Admin');
          }
        } else {
          console.log('Server invalidated token, clearing session');
          this.clearSession('Your session is no longer valid. Please log in again.');
        }
      },
      error: (error) => {
        console.error('Auth state check error:', error);
        if (error.status === 401 || error.status === 403) {
          console.log('Auth error, clearing session');
          this.clearSession('Unable to validate your session. Please log in again.');
        } else {
          // For network errors, try to use the token if it's valid locally
          const decodedToken = this.decodeToken(token);
          if (decodedToken) {
            const expirationDate = new Date(decodedToken.exp * 1000);
            const currentDate = new Date();
            if (expirationDate > currentDate) {
              console.log('Network error but token valid locally, keeping session');
              const role = this.getRoleFromToken(decodedToken);
              this.isLoggedInSubject.next(true);
              this.isAdminSubject.next(role === 'Admin');
            } else {
              console.log('Network error and token expired, clearing session');
              this.clearSession('Your session has expired. Please log in again.');
            }
          }
        }
      }
    });
  }

  private validateToken(token: string): Observable<boolean> {
    return this.http.get<{ isValid: boolean }>(`${this.apiUrl}/validate-token`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).pipe(
      map(response => response.isValid),
      catchError((error) => {
        console.error('Token validation error:', error);
        if (error.status === 401 || error.status === 403) {
          return of(false);
        }
        return of(true);
      })
    );
  }

  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(window.atob(base64));
    } catch {
      return null;
    }
  }

  private getRoleFromToken(decodedToken: any): string {
    if (decodedToken.roles && decodedToken.roles.length > 0) {
      const role = decodedToken.roles[0].replace('ROLE_', '');
      return role;
    }
    return 'User';
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          console.log('Login successful, storing token');
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem('username', credentials.username);
          const decodedToken = this.decodeToken(response.token);
          
          if (decodedToken) {
            const role = this.getRoleFromToken(decodedToken);
            this.isLoggedInSubject.next(true);
            this.isAdminSubject.next(role === 'Admin');
            localStorage.setItem(this.roleKey, role);
            
            this.notificationService.showSuccess('Successfully logged in!');
            
            this.router.navigate(['/user-dashboard']);
          }
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  private isTokenValid(token: string): boolean {
    const decodedToken = this.decodeToken(token);
    if (!decodedToken) return false;
    
    const expirationDate = new Date(decodedToken.exp * 1000);
    const currentDate = new Date();
    return expirationDate > currentDate;
  }

  clearSession(message?: string): void {
    console.log('Clearing session');
    this.isLoggedInSubject.next(false);
    this.isAdminSubject.next(false);
    
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
    localStorage.removeItem('username');
    localStorage.removeItem('resetPasswordEmail'); // Also clear reset password data
    
    if (message) {
      this.notificationService.showError(message);
    }
    
    // Only redirect to login if we're not on an auth page
    if (!this.isAuthPage()) {
      this.router.navigate(['/login']);
    }
  }

  logout(forceLogout: boolean = false): void {
    const message = forceLogout ? 
      'Your session has expired. Please log in again.' : 
      'You have been logged out.';
    this.clearSession(message);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    const decodedToken = this.decodeToken(token);
    if (!decodedToken) return false;
    
    const expirationDate = new Date(decodedToken.exp * 1000);
    const currentDate = new Date();
    return expirationDate > currentDate;
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user).pipe(
      tap(() => {
        this.notificationService.showSuccess('Registration successful! Please check your email for verification code.');
      })
    );
  }

  forgotPassword(email: string): Observable<ResetPasswordResponse> {
    console.log('Sending password reset request for email:', email);
    return this.http.post<ResetPasswordResponse>(`${this.apiUrl}/ResetPassword`, { email }).pipe(
      map(response => {
        console.log('Reset password response:', response);
        return { status: 'FOUND', message: 'Reset code sent successfully' } as ResetPasswordResponse;
      }),
      catchError((error) => {
        console.error('Reset password error:', error);
        if (error.status === 302 || error.status === 200) {
          return of({ status: 'FOUND', message: 'Reset code sent successfully' } as ResetPasswordResponse);
        }
        if (error.status === 404) {
          return of({ status: 'NOT_FOUND', message: 'Email address not found' } as ResetPasswordResponse);
        }
        if (error.status === 429) { // TOO_MANY_REQUESTS
          return of({ status: 'RATE_LIMITED', message: 'Please wait 2 minutes before requesting another code' } as ResetPasswordResponse);
        }
        throw error;
      })
    );
  }

  verifyCode(email: string, code: string): Observable<any> {
    console.log('Verifying code for email:', email);
    const params = new HttpParams().set('email', email);
    const body = { code };
    
    return this.http.post(`${this.apiUrl}/verifyCode`, body, { params }).pipe(
      map(response => {
        console.log('Code verification response:', response);
        return { status: 200, body: { success: true } };
      }),
      catchError((error) => {
        console.error('Code verification error:', error);
        if (error.status === 302 || error.status === 200) {
          return of({ status: 200, body: { success: true } });
        }
        throw error;
      })
    );
  }

  updatePassword(email: string, newPassword: string): Observable<any> {
    console.log('Updating password for email:', email);
    const params = new HttpParams().set('email', email);
    const body = { password: newPassword };
    
    return this.http.post(`${this.apiUrl}/UpdatePassword`, body, { params }).pipe(
      map(response => {
        console.log('Password update response:', response);
        return response;
      }),
      catchError((error) => {
        console.error('Password update error:', error);
        if (error.status === 302 || error.status === 200) {
          return of({ status: 200, body: { success: true } });
        }
        throw error;
      })
    );
  }

  updateProfile(username: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/updateProfile`, { username }).pipe(
      tap(() => {
        this.notificationService.showSuccess('Profile updated successfully!');
      })
    );
  }

  // Add method to check if user should be redirected
  checkAuthRedirect() {
    const isLoggedIn = this.isAuthenticated();
    const currentUrl = this.router.url;

    // Don't redirect if on reset password page
    if (currentUrl === '/reset-password') {
      return;
    }

    if (isLoggedIn) {
      // If logged in and at root or login, go to dashboard
      if (currentUrl === '/' || currentUrl === '/login') {
        this.router.navigate(['/user-dashboard']);
      }
    } else {
      // If not logged in and not on auth page, go to login
      if (!this.isAuthPage()) {
        this.router.navigate(['/login']);
      }
    }
  }
}
