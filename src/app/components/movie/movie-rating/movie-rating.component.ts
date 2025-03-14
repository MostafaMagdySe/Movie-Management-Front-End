import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MovieService, MovieRating } from '../../../services/movie.service';
import { NotificationService } from '../../../services/notification.service';
import { ConfirmationDialogComponent } from '../../../components/shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-movie-rating',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './movie-rating.component.html',
  styleUrls: ['./movie-rating.component.css']
})
export class MovieRatingComponent implements OnInit {
  @Input() movieId!: number;
  @Output() ratingSubmitted = new EventEmitter<void>();

  overallRating = 0;
  reviews: { username: string; rating: number; comment: string }[] = [];
  userRating = 0;
  userComment = '';
  isLoading = false;
  isSubmitting = false;
  hoverRating = 0;
  hasUserRated = false;
  currentUserRating: { username: string; rating: number; comment: string } | null = null;

  constructor(
    private movieService: MovieService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadRatings();
  }

  loadRatings(): void {
    this.isLoading = true;
    const currentUser = localStorage.getItem('username');
    this.movieService.getMovieRating(this.movieId).subscribe({
      next: (response: MovieRating) => {
        console.log('Rating response:', response);
        
        // Handle both single rating and array of ratings
        if (Array.isArray(response)) {
          this.reviews = response.map(rating => ({
            username: rating.username,
            rating: rating.rating,
            comment: rating.comment
          }));
        } else {
          this.reviews = [{
            username: response.username,
            rating: response.rating,
            comment: response.comment
          }];
        }

        // Check if current user has rated
        if (currentUser) {
          this.currentUserRating = this.reviews.find(review => review.username === currentUser) || null;
          this.hasUserRated = !!this.currentUserRating;
          if (this.hasUserRated && this.currentUserRating) {
            this.userRating = this.currentUserRating.rating;
            this.userComment = this.currentUserRating.comment;
          }
        }

        // Calculate overall rating
        if (this.reviews.length > 0) {
          const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
          this.overallRating = Number((totalRating / this.reviews.length).toFixed(1));
        } else {
          this.overallRating = 0;
        }
        
        console.log('Current user from localStorage:', currentUser);
        console.log('Has user rated:', this.hasUserRated);
        console.log('Reviews:', this.reviews);
        console.log('Calculated overall rating:', this.overallRating);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading ratings:', error);
        this.isLoading = false;
      }
    });
  }

  submitRating(): void {
    if (!this.userRating || !this.userComment.trim()) {
      this.notificationService.showError('Please provide both a rating and a comment');
      return;
    }

    this.isSubmitting = true;
    console.log('Submitting rating for movie:', this.movieId);
    console.log('Rating:', this.userRating);
    console.log('Comment:', this.userComment.trim());

    this.movieService.rateMovie(this.movieId, this.userRating, this.userComment.trim()).subscribe({
      next: (response) => {
        console.log('Rating submission successful:', response);
        this.notificationService.showSuccess('Rating submitted successfully');
        this.userRating = 0;
        this.userComment = '';
        this.hoverRating = 0;
        this.loadRatings();
        this.ratingSubmitted.emit();
        this.isSubmitting = false;
      },
      error: (error: any) => {
        console.error('Error submitting rating:', error);
        console.error('Error details:', {
          status: error.status,
          message: error.message,
          error: error.error
        });
        this.notificationService.showError(error.error?.message || 'Failed to submit rating');
        this.isSubmitting = false;
      }
    });
  }

  deleteRating(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Rating',
        message: 'Are you sure you want to delete your rating? This action cannot be undone.'
      },
      width: '400px',
      panelClass: 'confirmation-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        this.movieService.deleteRating(this.movieId).subscribe({
          next: () => {
            this.notificationService.showSuccess('Rating deleted successfully');
            // Clear the reviews array immediately
            this.reviews = [];
            this.overallRating = 0;
            // Reload ratings after a short delay
            setTimeout(() => {
              this.loadRatings();
            }, 500);
            this.ratingSubmitted.emit();
          },
          error: (error: any) => {
            console.error('Error deleting rating:', error);
            // Even if there's an error, try to reload the ratings
            this.loadRatings();
            this.notificationService.showError('Rating was deleted but there was an error refreshing the page');
          }
        });
      }
    });
  }

  getRatingLabel(rating: number): string {
    switch (rating) {
      case 10: return 'Masterpiece';
      case 9: return 'Excellent';
      case 8: return 'Very Good';
      case 7: return 'Good';
      case 6: return 'Above Average';
      case 5: return 'Average';
      case 4: return 'Below Average';
      case 3: return 'Poor';
      case 2: return 'Very Poor';
      case 1: return 'Terrible';
      default: return '';
    }
  }

  isCurrentUserRating(username: string): boolean {
    const currentUser = localStorage.getItem('username');
    console.log('Checking if rating is from current user:', {
      currentUser,
      ratingUsername: username,
      isMatch: currentUser === username
    });
    return currentUser === username;
  }
}

