import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MovieBasic, MovieDetails } from '../shared/models/movie.model';
import { environment } from '../../environments/environment';

export interface Movie {
  id: number;
  title: string;
  description: string;
  releaseYear: number;
  director: string;
  genre: string;
  rating: number;
  imageUrl: string;
}

export interface MovieRating {
  username: string;
  rating: number;
  comment: string;
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', {
      url: error.url,
      status: error.status,
      message: error.error?.message || error.message,
      error: error
    });
    return throwError(() => error);
  }

  // Get all movies with pagination (basic info for dashboard)
  getMovies(pageNo: number = 1, pageSize: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('PageNo', pageNo.toString())
      .set('PageSize', pageSize.toString());
    
    return this.http.get(`${this.apiUrl}/`, { params }).pipe(
      tap(response => console.log('Movies response:', response)),
      catchError(this.handleError)
    );
  }

  // Get movie details by name
  getMovieDetails(title: string): Observable<MovieDetails> {
    console.log(`Fetching details for movie: ${title}`);
    const encodedTitle = encodeURIComponent(title);
    return this.http.get<MovieDetails>(`${this.apiUrl}/Movies/${encodedTitle}`).pipe(
      tap(response => console.log('Movie details response:', response)),
      catchError(error => {
        console.error('Error fetching movie details:', {
          title,
          error: error
        });
        return this.handleError(error);
      })
    );
  }

  // Search movies by keyword
  searchMovies(keyword: string): Observable<MovieBasic[]> {
    const params = new HttpParams().set('keyword', keyword);
    return this.http.get<MovieBasic[]>(`${this.apiUrl}/search`, { params }).pipe(
      catchError(this.handleError)
    );
  }

  // Admin: Add movies
  addMovies(titles: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/movieInsertion`, { titles }).pipe(
      catchError(error => {
        // If we get a 200 status, it's actually a success
        if (error.status === 200) {
          return of({ success: true });
        }
        return throwError(() => error);
      })
    );
  }

  // Admin: Delete movies
  removeMovies(titles: string[]): Observable<any> {
    return this.http.delete(`${this.apiUrl}/movieDeletion`, { body: { titles } }).pipe(
      catchError(error => {
        // If we get a 200 status, it's actually a success
        if (error.status === 200) {
          return of({ success: true });
        }
        return throwError(() => error);
      })
    );
  }

  // Rate a movie
  rateMovie(movieId: number, rating: number, comment: string): Observable<any> {
    console.log('Submitting rating:', { movie_id: movieId, rating, comment });
    return this.http.post(`${this.apiUrl}/rateMovie`, { 
      movie_id: movieId,
      rating: rating,
      comment: comment
    }).pipe(
      tap(response => console.log('Rating submission response:', response)),
      catchError(error => {
        console.error('Rating submission error:', error);
        return this.handleError(error);
      })
    );
  }

  // Delete a movie rating
  deleteRating(movieId: number): Observable<any> {
    console.log('Deleting rating for movie:', movieId);
    return this.http.delete(`${this.apiUrl}/deleteMovieRating`, { 
      body: { movie_id: movieId }
    }).pipe(
      tap(response => console.log('Rating deletion response:', response)),
      catchError(error => {
        console.error('Rating deletion error:', error);
        // Don't throw the error, just return an empty object
        return of({});
      })
    );
  }

  // Get all movies (uses the root endpoint with pagination)
  getAllMovies(): Observable<Movie[]> {
    return this.http.get<Movie[]>(`${this.apiUrl}/Movies`);
  }

  getMovieById(id: number): Observable<Movie> {
    return this.http.get<Movie>(`${this.apiUrl}/Movies/${id}`);
  }

  getMovieByTitle(title: string): Observable<MovieDetails> {
    const encodedTitle = encodeURIComponent(title);
    return this.http.get<MovieDetails>(`${this.apiUrl}/Movies/${encodedTitle}`).pipe(
      tap(response => console.log('Movie details response:', response)),
      catchError(error => {
        console.error('Error fetching movie details:', {
          title,
          error: error
        });
        return this.handleError(error);
      })
    );
  }

  addMovie(movie: Partial<MovieBasic>): Observable<MovieBasic> {
    return this.http.post<MovieBasic>(`${this.apiUrl}/api/movies`, movie);
  }

  updateMovie(id: number, movie: Partial<MovieBasic>): Observable<MovieBasic> {
    return this.http.put<MovieBasic>(`${this.apiUrl}/api/movies/${id}`, movie);
  }

  deleteMovie(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/api/movies/${id}`);
  }

  // Get movie details from OMDB API
  getOmdbMovieDetails(title: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/movieDetails/${title}`);
  }

  // Get movie ratings and comments
  getMovieRating(movieId: number): Observable<MovieRating> {
    return this.http.get<MovieRating>(`${this.apiUrl}/Rating/${movieId}`);
  }
}