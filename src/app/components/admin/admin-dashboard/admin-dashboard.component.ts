import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MovieService } from '../../../services/movie.service';
import { NotificationService } from '../../../services/notification.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressBarModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  movieTitles: string = '';
  responseMessage: string = '';
  isLoading: boolean = false;
  selectedMovies: string[] = [];
  batchForm: any;

  constructor(
    private movieService: MovieService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.batchForm = this.formBuilder.group({
      titles: ['', [Validators.required, Validators.pattern(/^[^\n]+$/)]]
    });
  }

  private validateInput(): boolean {
    if (!this.movieTitles.trim()) {
      this.notificationService.showError('Please enter at least one movie title');
      return false;
    }
    return true;
  }

  private processMovieTitles(): string[] {
    return this.movieTitles
      .split('\n')
      .map(title => title.trim())
      .filter(title => title);
  }

  private handleSuccess(message: string) {
    this.notificationService.showSuccess(message);
    this.movieTitles = '';
    this.isLoading = false;
  }

  private handleError(error: any, defaultMessage: string) {
    const errorMessage = error.error?.message || defaultMessage;
    this.notificationService.showError(errorMessage);
    this.responseMessage = errorMessage;
    this.isLoading = false;
  }

  addMovies(): void {
    if (!this.movieTitles.trim()) {
      this.notificationService.showError('Please enter at least one movie title');
      return;
    }

    const titles = this.movieTitles
      .split('\n')
      .map(title => title.trim())
      .filter(title => title.length > 0);

    if (titles.length === 0) {
      this.notificationService.showError('Please enter at least one movie title');
      return;
    }

    this.isLoading = true;
    this.movieService.addMovies(titles).subscribe({
      next: (response) => {
        if (response?.success || response === null) {
          this.notificationService.showSuccess('Movies added successfully');
          this.movieTitles = '';
          window.location.reload();
        } else {
          this.notificationService.showError('Failed to add movies. Please try again.');
        }
        this.isLoading = false;
      },
      error: (error) => {
        if (error.status === 200) {
          this.notificationService.showSuccess('Movies added successfully');
          this.movieTitles = '';
          window.location.reload();
        } else {
          this.notificationService.showError('Failed to add movies. Please try again.');
        }
        this.isLoading = false;
      }
    });
  }

  removeMovies(): void {
    if (!this.movieTitles.trim()) {
      this.notificationService.showError('Please enter at least one movie title');
      return;
    }

    const titles = this.movieTitles
      .split('\n')
      .map(title => title.trim())
      .filter(title => title.length > 0);

    if (titles.length === 0) {
      this.notificationService.showError('Please enter at least one movie title');
      return;
    }

    this.isLoading = true;
    this.movieService.removeMovies(titles).subscribe({
      next: (response) => {
        if (response?.success || response === null) {
          this.notificationService.showSuccess('Movies removed successfully');
          this.movieTitles = '';
          window.location.reload();
        } else {
          this.notificationService.showError('Failed to remove movies. Please try again.');
        }
        this.isLoading = false;
      },
      error: (error) => {
        if (error.status === 200) {
          this.notificationService.showSuccess('Movies removed successfully');
          this.movieTitles = '';
          window.location.reload();
        } else {
          this.notificationService.showError('Failed to remove movies. Please try again.');
        }
        this.isLoading = false;
      }
    });
  }

  processBatchMovies(action: 'add' | 'delete'): void {
    if (this.batchForm.invalid) {
      return;
    }

    const titlesText = this.batchForm.value.titles;
    const titles = titlesText.split(',').map((title: string) => title.trim()).filter((title: string) => title);
    
    if (titles.length === 0) {
      this.notificationService.showError('Please enter valid movie titles, separated by commas');
      return;
    }

    if (titles.length > 10) {
      this.notificationService.showError('You can process a maximum of 10 movies at once');
      return;
    }

    this.isLoading = true;
    
    if (action === 'add') {
      this.movieService.addMovies(titles).subscribe({
        next: (response) => {
          if (response?.success || response === null) {
            this.notificationService.showSuccess('Movies added successfully');
            this.batchForm.reset();
            window.location.reload();
          } else {
            this.notificationService.showError('Failed to add movies. Please try again.');
          }
          this.isLoading = false;
        },
        error: (error) => {
          if (error.status === 200) {
            this.notificationService.showSuccess('Movies added successfully');
            this.batchForm.reset();
            window.location.reload();
          } else {
            this.notificationService.showError('Failed to add movies. Please try again.');
          }
          this.isLoading = false;
        }
      });
    } else {
      this.movieService.removeMovies(titles).subscribe({
        next: (response) => {
          if (response?.success || response === null) {
            this.notificationService.showSuccess('Movies removed successfully');
            this.batchForm.reset();
            window.location.reload();
          } else {
            this.notificationService.showError('Failed to remove movies. Please try again.');
          }
          this.isLoading = false;
        },
        error: (error) => {
          if (error.status === 200) {
            this.notificationService.showSuccess('Movies removed successfully');
            this.batchForm.reset();
            window.location.reload();
          } else {
            this.notificationService.showError('Failed to remove movies. Please try again.');
          }
          this.isLoading = false;
        }
      });
    }
  }
}
