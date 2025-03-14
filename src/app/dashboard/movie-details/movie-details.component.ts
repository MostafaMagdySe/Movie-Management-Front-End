// src/app/dashboard/movie-details/movie-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { MovieService } from '../../core/services/movie.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.scss']
})
export class MovieDetailsComponent implements OnInit {
  movie: any;
  isLoading = false;
  ratingForm: FormGroup;
  userHasRated = false;
  isAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private movieService: MovieService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.ratingForm = this.formBuilder.group({
      rating: ['', [Validators.required, Validators.min(1), Validators.max(10)]],
      comment: ['']
    });

    this.isAdmin = this.authService.isAdmin();
    this.loadMovieDetails();
  }

  loadMovieDetails(): void {
    this.isLoading = true;
    const movieName = this.route.snapshot.paramMap.get('name');
    
    if (movieName) {
      this.movieService.getMovieDetails(movieName).subscribe({
        next: (data) => {
          this.movie = data;
          this.isLoading = false;
          
          // Check if user has rated this movie
          if (this.movie.userRating) {
            this.userHasRated = true;
            this.ratingForm.patchValue({
              rating: this.movie.userRating.rating,
              comment: this.movie.userRating.comment
            });
            this.ratingForm.disable();
          }
        },
        error: (error) => {
          this.notificationService.showError('Error loading movie details');
          this.isLoading = false;
          this.goBack();
        }
      });
    } else {
      this.notificationService.showError('Movie name not provided');
      this.goBack();
    }
  }

  goBack(): void {
    this.location.back();
  }

  submitRating(): void {
    if (this.ratingForm.invalid) {
      return;
    }

    this.isLoading = true;
    const ratingData = {
      rating: this.ratingForm.value.rating,
      comment: this.ratingForm.value.comment,
      movie_id: this.movie.id
    };

    this.movieService.rateMovie(ratingData).subscribe({
      next: () => {
        this.notificationService.showSuccess('Rating submitted successfully');
        this.userHasRated = true;
        this.ratingForm.disable();
        this.isLoading = false;
        this.loadMovieDetails(); // Reload to get updated ratings
      },
      error: (error) => {
        this.notificationService.showError('Error submitting rating');
        this.isLoading = false;
      }
    });
  }

  deleteRating(): void {
    this.isLoading = true;
    const ratingData = {
      movie_id: this.movie.id,
      rating: 0,
      comment: ''
    };

    this.movieService.deleteRating(ratingData).subscribe({
      next: () => {
        this.notificationService.showSuccess('Rating deleted successfully');
        this.userHasRated = false;
        this.ratingForm.enable();
        this.ratingForm.reset();
        this.isLoading = false;
        this.loadMovieDetails(); // Reload to get updated ratings
      },
      error: (error) => {
        this.notificationService.showError('Error deleting rating');
        this.isLoading = false;
      }
    });
  }
}