// src/app/dashboard/movie-list/movie-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MovieService } from '../../core/services/movie.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-movie-list',
  templateUrl: './movie-list.component.html',
  styleUrls: ['./movie-list.component.scss']
})
export class MovieListComponent implements OnInit {
  movies: any[] = [];
  isLoading = false;
  currentPage = 1;
  pageSize = 12;
  totalMovies = 0;

  constructor(
    private router: Router,
    private movieService: MovieService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(): void {
    this.isLoading = true;
    this.movieService.getAllMovies(this.currentPage, this.pageSize).subscribe({
      next: (data) => {
        this.movies = data;
        // Assuming total count can be retrieved from the data or a separate API call
        // For now, let's estimate using the size of the returned array
        if (data.length < this.pageSize) {
          this.totalMovies = (this.currentPage - 1) * this.pageSize + data.length;
        } else if (this.currentPage === 1) {
          this.totalMovies = this.pageSize * 10; // Arbitrary estimate
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.showError('Error loading movies');
        this.isLoading = false;
      }
    });
  }

  viewMovieDetails(movieName: string): void {
    this.router.navigate(['/dashboard/movie', movieName]);
  }

  changePage(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadMovies();
  }
}