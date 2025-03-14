import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  currentStep: 'email' | 'code' | 'password' = 'email';
  email: string = '';
  code: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  isLoading = false;
  isRateLimited = false;
  rateLimitTimer: any = null;
  remainingTime: number = 0;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Clear any existing reset password data when the component initializes
    this.clearResetPasswordData();
  }

  ngOnDestroy(): void {
    // Clear reset password data when leaving the component
    this.clearResetPasswordData();
    if (this.rateLimitTimer) {
      clearInterval(this.rateLimitTimer);
    }
  }

  private clearResetPasswordData(): void {
    localStorage.removeItem('resetPasswordEmail');
    this.email = '';
    this.code = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.currentStep = 'email';
    this.isRateLimited = false;
    this.remainingTime = 0;
    if (this.rateLimitTimer) {
      clearInterval(this.rateLimitTimer);
      this.rateLimitTimer = null;
    }
  }

  private startRateLimitTimer(): void {
    this.isRateLimited = true;
    this.remainingTime = 120; // 2 minutes in seconds
    this.rateLimitTimer = setInterval(() => {
      this.remainingTime--;
      if (this.remainingTime <= 0) {
        this.isRateLimited = false;
        clearInterval(this.rateLimitTimer);
        this.rateLimitTimer = null;
      }
    }, 1000); // Update every second
  }

  getFormattedTime(): string {
    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  submitEmail(): void {
    if (!this.email) {
      this.notificationService.showError('Please enter your email address');
      return;
    }

    if (this.isRateLimited) {
      this.notificationService.showError('Please wait 2 minutes before requesting another code');
      return;
    }

    console.log('Submitting email for password reset:', this.email);
    this.isLoading = true;

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        console.log('Reset password response:', response);
        this.isLoading = false;
        
        if (response.status === 'FOUND') {
          // Store email in case of page refresh
          localStorage.setItem('resetPasswordEmail', this.email);
          // Update UI state
          this.currentStep = 'code';
          this.notificationService.showSuccess(response.message || `A verification code has been sent to ${this.email}`);
        } else if (response.status === 'RATE_LIMITED') {
          this.startRateLimitTimer();
          this.notificationService.showError(response.message || 'Please wait 2 minutes before requesting another code');
        } else {
          this.notificationService.showError(response.message || 'Email address not found');
        }
      },
      error: (error) => {
        console.error('Reset password error:', error);
        this.isLoading = false;
        
        if (error.status === 404) {
          this.notificationService.showError('Email address not found');
        } else if (error.status === 0) {
          this.notificationService.showError('Unable to connect to the server. Please check your internet connection.');
        } else {
          this.notificationService.showError(`Error: ${error.error?.message || 'An unexpected error occurred'}`);
        }
      }
    });
  }

  submitCode(): void {
    if (!this.code) {
      this.notificationService.showError('Please enter the verification code');
      return;
    }

    console.log('Submitting verification code for email:', this.email);
    this.isLoading = true;

    this.authService.verifyCode(this.email, this.code).subscribe({
      next: (response) => {
        console.log('Code verification response:', response);
        this.isLoading = false;
        
        // If we get a 200 or 302 response, consider it a success
        if (response.status === 200 || response.status === 302) {
          this.currentStep = 'password';
          this.notificationService.showSuccess('Code verified successfully. Please enter your new password.');
        } else {
          this.notificationService.showError('Invalid verification code. Please try again.');
        }
      },
      error: (error) => {
        console.error('Code verification error:', error);
        this.isLoading = false;
        
        if (error.status === 400) {
          this.notificationService.showError('Invalid verification code. Please try again.');
        } else if (error.status === 404) {
          this.notificationService.showError('Email not found or code expired. Please restart the process.');
          // Reset the process
          this.clearResetPasswordData();
        } else {
          this.notificationService.showError('An error occurred. Please try again.');
        }
      }
    });
  }

  submitNewPassword(): void {
    if (!this.newPassword || !this.confirmPassword) {
      this.notificationService.showError('Please enter and confirm your new password');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.notificationService.showError('Passwords do not match');
      return;
    }

    if (this.newPassword.length < 6) {
      this.notificationService.showError('Password must be at least 6 characters long');
      return;
    }

    console.log('Submitting new password for email:', this.email);
    this.isLoading = true;

    this.authService.updatePassword(this.email, this.newPassword).subscribe({
      next: () => {
        console.log('Password update successful');
        this.isLoading = false;
        this.notificationService.showSuccess('Password updated successfully. Please log in with your new password.');
        // Clean up and redirect
        this.clearResetPasswordData();
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Password update error:', error);
        this.isLoading = false;
        
        if (error.status === 404) {
          this.notificationService.showError('Session expired. Please restart the password reset process.');
          this.clearResetPasswordData();
        } else {
          this.notificationService.showError('Failed to update password. Please try again.');
        }
      }
    });
  }
} 