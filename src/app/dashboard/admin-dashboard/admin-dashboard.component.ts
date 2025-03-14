// src/app/dashboard/admin-dashboard/admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MovieService } from '../../services/movie.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule
  ],
  providers: [MovieService, NotificationService],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  searchForm!: FormGroup;
  batchForm!: FormGroup;
  searchResults: any[] = [];
  selectedMovies: string[] = [];
  isLoading = false;

  constructor(
    private movieService: MovieService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.searchForm = this.formBuilder.group({
      title: ['', Validators.required]
    });

    this.batchForm = this.formBuilder.group({
      titles: ['', [Validators.required, Validators.pattern(/^[^\n]+$/)]]
    });
  }

  searchMovie(): void {
    if (this.searchForm.invalid) return;
    
    this.isLoading = true;
    const title = this.searchForm.get('title')?.value;
    
    // Implement your search logic here
    this.isLoading = false;
  }

  toggleMovieSelection(title: string): void {
    const index = this.selectedMovies.indexOf(title);
    if (index === -1) {
      this.selectedMovies.push(title);
    } else {
      this.selectedMovies.splice(index, 1);
    }
  }

  isSelected(title: string): boolean {
    return this.selectedMovies.includes(title);
  }

  addSelectedMovies(): void {
    if (this.selectedMovies.length === 0) {
      this.notificationService.showError('No movies selected');
      return;
    }

    this.isLoading = true;
    this.movieService.addMovies(this.selectedMovies).subscribe({
      next: (response: any) => {
        this.notificationService.showSuccess('Movies added successfully');
        this.selectedMovies = [];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.notificationService.showError('Error adding movies');
        this.isLoading = false;
      }
    });
  }

  removeMovies(): void {
    if (this.selectedMovies.length === 0) {
      this.notificationService.showError('No movies selected');
      return;
    }

    this.isLoading = true;
    this.movieService.removeMovies(this.selectedMovies).subscribe({
      next: (response: any) => {
        this.notificationService.showSuccess('Movies removed successfully');
        this.selectedMovies = [];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.notificationService.showError('Error removing movies');
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
        next: (response: any) => {
          this.notificationService.showSuccess('Movies added successfully');
          this.batchForm.reset();
          this.isLoading = false;
        },
        error: (error: any) => {
          this.notificationService.showError('Error adding movies');
          this.isLoading = false;
        }
      });
    } else {
      this.movieService.removeMovies(titles).subscribe({
        next: (response: any) => {
          this.notificationService.showSuccess('Movies removed successfully');
          this.batchForm.reset();
          this.isLoading = false;
        },
        error: (error: any) => {
          this.notificationService.showError('Error removing movies');
          this.isLoading = false;
        }
      });
    }
  }
}