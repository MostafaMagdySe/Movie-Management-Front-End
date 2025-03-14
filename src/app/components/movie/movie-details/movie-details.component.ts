import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MovieService, MovieRating } from '../../../services/movie.service';
import { MovieDetails } from '../../../shared/models/movie.model';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MovieRatingComponent } from '../movie-rating/movie-rating.component';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatProgressSpinnerModule, MovieRatingComponent],
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.css']
})
export class MovieDetailsComponent implements OnInit {
  movie: MovieDetails | null = null;
  loading = true;
  error: string | null = null;
  overallRating = 0;

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService
  ) {}

  ngOnInit(): void {
    const title = this.route.snapshot.paramMap.get('title');
    if (title) {
      this.loadMovieDetails(title);
    }
  }

  loadMovieDetails(title: string): void {
    this.movieService.getMovieDetails(title).subscribe({
      next: (movie) => {
        this.movie = movie;
        this.loadOverallRating(movie.id);
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load movie details';
        console.error('Error loading movie details:', error);
        this.loading = false;
      }
    });
  }

  loadOverallRating(movieId: number): void {
    this.movieService.getMovieRating(movieId).subscribe({
      next: (response: MovieRating) => {
        // Handle both single rating and array of ratings
        let reviews: MovieRating[];
        if (Array.isArray(response)) {
          reviews = response;
        } else {
          reviews = [response];
        }

        // Calculate overall rating
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
          this.overallRating = Number((totalRating / reviews.length).toFixed(1));
        } else {
          this.overallRating = 0;
        }
        console.log('Calculated overall rating:', this.overallRating);
      },
      error: (error) => {
        console.error('Error loading overall rating:', error);
      }
    });
  }

  onRatingSubmitted(): void {
    if (this.movie) {
      this.loadOverallRating(this.movie.id);
    }
  }
}
