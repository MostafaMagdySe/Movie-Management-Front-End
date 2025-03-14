import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MovieService } from '../../core/services/movie.service';
import { Movie } from '../../models/movie.model';

@Component({
  selector: 'app-search-movies',
  templateUrl: './search-movies.component.html',
  styleUrls: ['./search-movies.component.css']
})
export class SearchMoviesComponent implements OnInit {
  keyword: string = '';
  searchResults: Movie[] = [];
  searching: boolean = false;
  noResults: boolean = false;

  constructor(
    private movieService: MovieService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Check for search keyword in URL params
    this.route.queryParams.subscribe(params => {
      if (params['keyword']) {
        this.keyword = params['keyword'];
        this.searchMovies();
      }
    });
  }

  searchMovies(): void {
    if (!this.keyword.trim()) {
      return;
    }
    
    this.searching = true;
    this.noResults = false;
    
    // Update URL with search keyword
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { keyword: this.keyword },
      queryParamsHandling: 'merge'
    });
    
    this.movieService.searchMovies(this.keyword).subscribe({
      next: (movies) => {
        this.searchResults = movies;
        this.searching = false;
        this.noResults = movies.length === 0;
      },
      error: (error) => {
        console.error('Error searching movies:', error);
        this.searching = false;
        this.noResults = true;
        this.searchResults = [];
      }
    });
  }

  viewMovieDetails(movieTitle: string): void {
    this.router.navigate(['/dashboard/movie-details', movieTitle]);
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.searchMovies();
    }
  }
}