import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsernameRequest } from '../models/auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  // Update user profile
  updateProfile(userDetails: UsernameRequest): Observable<any> {
    return this.http.patch(`${this.baseUrl}/updateProfile`, userDetails);
  }
}
