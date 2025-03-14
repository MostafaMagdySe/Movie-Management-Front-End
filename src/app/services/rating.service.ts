import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RatingRequest } from '../models/rating';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private baseUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  // Rate a movie
  rateMovie(rating: RatingRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/rateMovie`, rating);
  }

  // Delete a rating
  deleteRating(rating: RatingRequest): Observable<string> {
    return this.http.delete(`${this.baseUrl}/deleteMovieRating`, { 
      body: rating,
      responseType: 'text' 
    });
  }
}
