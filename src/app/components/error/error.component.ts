import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  template: `
    <div class="error-container">
      <mat-icon color="warn" class="error-icon">error_outline</mat-icon>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <button mat-raised-button color="primary" routerLink="/">
        <mat-icon>home</mat-icon>
        Return to Home
      </button>
    </div>
  `,
  styles: [`
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      text-align: center;
      padding: 20px;
    }
    .error-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 20px;
    }
    h1 {
      color: #f44336;
      margin-bottom: 16px;
    }
    p {
      color: #666;
      margin-bottom: 24px;
    }
    button {
      padding: 12px 24px;
    }
  `]
})
export class ErrorComponent {} 