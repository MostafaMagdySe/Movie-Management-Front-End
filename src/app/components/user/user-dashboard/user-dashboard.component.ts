// src/app/dashboard/user-dashboard/user-dashboard.component.ts
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MovieService } from '../../../services/movie.service';
import { MovieBasic } from '../../../shared/models/movie.model';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SearchService } from '../../../services/search.service';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatPaginatorModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.css']
})
export class UserDashboardComponent implements OnInit {
  @ViewChild('addMoviesDialog') addMoviesDialog!: TemplateRef<any>;
  @ViewChild('removeMoviesDialog') removeMoviesDialog!: TemplateRef<any>;
  
  movies: MovieBasic[] = [];
  loading = false;
  error = '';
  
  // Pagination
  totalMovies: number = 0;
  pageSize: number = 10;
  currentPage: number = 1;

  movieTitles: string = '';
  isAdmin$: Observable<boolean>;

  searchControl = new FormControl('');
  isSearching = false;

  constructor(
    private movieService: MovieService,
    private authService: AuthService,
    private dialog: MatDialog,
    private notificationService: NotificationService,
    private searchService: SearchService
  ) {
    this.isAdmin$ = this.authService.isAdmin$;
  }

  ngOnInit(): void {
    console.log('UserDashboardComponent initialized');
    this.loadMovies();

    // Subscribe to search input changes
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      if (value) {
        this.performSearch(value);
      } else {
        this.loadMovies(); // Reset to normal view when search is cleared
      }
    });
  }

  loadMovies(): void {
    this.loading = true;
    this.error = '';
    console.log('Loading movies, page:', this.currentPage, 'size:', this.pageSize);

    this.movieService.getMovies(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        console.log('Raw movies response:', response);
        
        // Handle different response structures
        if (Array.isArray(response)) {
          console.log('Response is an array');
          this.movies = response.map(movie => ({
            title: movie.title || movie.Title,
            poster: movie.poster || movie.Poster
          }));
          this.totalMovies = response.length;
        } else if (response && typeof response === 'object') {
          console.log('Response is an object');
          if (response.content) {
            this.movies = response.content.map((movie: any) => ({
              title: movie.title || movie.Title,
              poster: movie.poster || movie.Poster
            }));
            this.totalMovies = response.totalElements || response.content.length;
          } else {
            // Handle case where response might be a single movie or different structure
            const moviesList = Object.values(response).filter(item => item && typeof item === 'object');
            this.movies = moviesList.map((movie: any) => ({
              title: movie.title || movie.Title,
              poster: movie.poster || movie.Poster
            }));
            this.totalMovies = moviesList.length;
          }
        }
        
        console.log('Processed movies:', this.movies);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading movies:', error);
        this.error = 'Failed to load movies. Please try again later.';
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1; // PageEvent is 0-based, but our API is 1-based
    this.pageSize = event.pageSize;
    this.loadMovies();
  }

  openAddMoviesDialog(): void {
    this.movieTitles = '';
    this.dialog.open(this.addMoviesDialog, {
      width: '500px'
    });
  }

  openRemoveMoviesDialog(): void {
    this.movieTitles = '';
    this.dialog.open(this.removeMoviesDialog, {
      width: '500px'
    });
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

    this.movieService.addMovies(titles).subscribe({
      next: () => {
        this.notificationService.showSuccess('Movies added successfully');
        this.dialog.closeAll();
        this.loadMovies(); // Refresh the movie list
        this.movieTitles = '';
      },
      error: (error) => {
        console.error('Error adding movies:', error);
        this.notificationService.showError('Failed to add movies. Please try again.');
      }
    });
  }

  removeMovies(): void {
    if (!this.movieTitles.trim()) return;

    const titles = this.movieTitles
      .split('\n')
      .map(title => title.trim())
      .filter(title => title.length > 0);

    if (titles.length === 0) {
      this.notificationService.showError('Please enter at least one movie title');
      return;
    }

    this.movieService.removeMovies(titles).subscribe({
      next: () => {
        this.notificationService.showSuccess('Movies removed successfully');
        this.dialog.closeAll();
        this.loadMovies(); // Refresh the movie list
        this.movieTitles = '';
      },
      error: (error) => {
        console.error('Error removing movies:', error);
        this.notificationService.showError('Failed to remove movies. Please try again.');
      }
    });
  }

  performSearch(keyword: string): void {
    if (!keyword.trim()) return;
    
    this.isSearching = true;
    this.loading = true;
    this.error = '';

    this.searchService.searchMovies(keyword).subscribe({
      next: (response: any) => {
        console.log('Search results:', response);
        
        // Handle the response similar to loadMovies()
        if (Array.isArray(response)) {
          this.movies = response.map(movie => ({
            title: movie.title || movie.Title,
            poster: movie.poster || movie.Poster
          }));
          this.totalMovies = response.length;
        } else if (response && typeof response === 'object') {
          if (response.content) {
            this.movies = response.content.map((movie: any) => ({
              title: movie.title || movie.Title,
              poster: movie.poster || movie.Poster
            }));
            this.totalMovies = response.totalElements || response.content.length;
          } else {
            const moviesList = Object.values(response).filter(item => item && typeof item === 'object');
            this.movies = moviesList.map((movie: any) => ({
              title: movie.title || movie.Title,
              poster: movie.poster || movie.Poster
            }));
            this.totalMovies = moviesList.length;
          }
        }
        
        this.loading = false;
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Error searching movies:', error);
        this.error = 'Failed to search movies. Please try again.';
        this.loading = false;
        this.isSearching = false;
      }
    });
  }

  onSearchSubmit(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    const searchValue = this.searchControl.value;
    if (searchValue) {
      this.performSearch(searchValue);
    }
  }

  clearSearch(): void {
    this.searchControl.setValue('');
    this.isSearching = false;
    this.loadMovies();
  }
}