import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MovieService } from '../../../services/movie.service';
import { AuthService } from '../../../services/auth.service';
import { Movie } from '../../../shared/models/movie.model';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.css']
})
export class MovieListComponent implements OnInit {
  allMovies: Movie[] = [];
  movies: Movie[] = [];
  loading = false;
  isAdmin = false;
  isAuthenticated = false;
  searchControl = new FormControl('');
  
  // Pagination
  pageSize = 10;
  currentPage = 0;
  totalMovies = 0;

  constructor(
    private movieService: MovieService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.isAuthenticated = this.authService.isAuthenticated();
    
    if (this.isAuthenticated) {
      this.loadMovies();

      // Set up search with debounce
      this.searchControl.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged()
      ).subscribe(query => {
        if (query && query.length > 2) {
          this.searchMovies(query);
        } else if (!query) {
          this.updateDisplayedMovies();
        }
      });
    }
  }

  loadMovies(): void {
    this.loading = true;
    this.movieService.getAllMovies().subscribe({
      next: (response: Movie[]) => {
        this.allMovies = response;
        this.totalMovies = response.length;
        this.updateDisplayedMovies();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching movies:', error);
        this.loading = false;
      }
    });
  }

  updateDisplayedMovies(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.movies = this.allMovies.slice(start, end);
  }

  searchMovies(query: string): void {
    this.loading = true;
    this.movieService.searchMovies(query).subscribe({
      next: (response: Movie[]) => {
        this.allMovies = response;
        this.totalMovies = response.length;
        this.updateDisplayedMovies();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error searching movies:', error);
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDisplayedMovies();
  }
}