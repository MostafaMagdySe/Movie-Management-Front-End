import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface UserProfile {
  username: string;
  email: string;
  phone: string;
}

export interface UpdateProfileRequest {
  username: string;
  newEmail?: string;
  phone?: string;
  newUsername?: string;
}

export interface UserNameResponse {
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private handleError(error: HttpErrorResponse) {
    return throwError(() => error);
  }

  getUserProfile(username: string): Observable<UserProfile> {
    const params = new HttpParams().set('username', username);
    return this.http.get<UserProfile>(`${this.apiUrl}/userProfile`, { 
      params,
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }

  updateProfile(request: UpdateProfileRequest): Observable<UserProfile> {
    return this.http.patch<UserProfile>(`${this.apiUrl}/updateProfile`, request, {
      headers: this.getHeaders(),
      withCredentials: true
    }).pipe(
      catchError(this.handleError)
    );
  }
} 