// src/app/dashboard/user-dashboard/user-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { Movie } from '../../core/models/movie.model';
import { MovieService } from '../../core/services/movie.service';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss']
})
export class UserDashboardComponent implements OnInit {
  movies: Movie[] = [];
  loading: boolean = true;
  error: string = '';
  
  // Pagination
  totalMovies: number = 0;
  pageSize: number = 10;
  currentPage: number = 0;

  constructor(private movieService: MovieService) { }

  ngOnInit(): void {
    this.loadMovies();
  }

  loadMovies(pageNo: number = 1, pageSize: number = 10): void {
    this.loading = true;
    this.movieService.getMovies(pageNo, pageSize).subscribe({
      next: (response) => {
        this.movies = response;
        this.totalMovies = response.length > 0 ? response.length + ((pageNo - 1) * pageSize) : 0;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Failed to load movies. Please try again later.';
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadMovies(this.currentPage + 1, this.pageSize);
  }
}