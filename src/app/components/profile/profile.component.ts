import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ProfileService, UserProfile, UpdateProfileRequest } from '../../services/profile.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <div class="profile-container">
      <div class="profile-card">
        <h2>My Profile</h2>
        <div *ngIf="loading" class="loading-spinner">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
        <form [formGroup]="profileForm" class="profile-content" *ngIf="!loading">
          <!-- Username Section -->
          <div class="profile-field">
            <div class="field-header">
              <span class="field-label">Username</span>
              <button mat-icon-button 
                      *ngIf="!isEditing" 
                      (click)="startEditing()" 
                      class="edit-button">
                <mat-icon>edit</mat-icon>
              </button>
            </div>
            <div class="field-content">
              <div class="current-value">
                <span class="value-label">Current:</span>
                <span class="field-value">{{ profileForm.get('currentUsername')?.value }}</span>
              </div>
              <div class="new-value" *ngIf="isEditing">
                <span class="value-label">New:</span>
                <mat-form-field appearance="fill">
                  <input matInput formControlName="newUsername" placeholder="Enter new username">
                </mat-form-field>
              </div>
            </div>
          </div>

          <!-- Email Section -->
          <div class="profile-field">
            <div class="field-header">
              <span class="field-label">Email</span>
            </div>
            <div class="field-content">
              <div class="current-value">
                <span class="value-label">Current:</span>
                <span class="field-value">{{ profileForm.get('email')?.value }}</span>
              </div>
              <div class="new-value" *ngIf="isEditing">
                <span class="value-label">New:</span>
                <mat-form-field appearance="fill">
                  <input matInput formControlName="newEmail" type="email" placeholder="Enter new email">
                  <mat-error *ngIf="profileForm.get('newEmail')?.hasError('email')">
                    Please enter a valid email address
                  </mat-error>
                </mat-form-field>
              </div>
            </div>
          </div>

          <!-- Phone Section -->
          <div class="profile-field">
            <div class="field-header">
              <span class="field-label">Phone</span>
            </div>
            <div class="field-content">
              <div class="current-value">
                <span class="value-label">Current:</span>
                <span class="field-value">{{ profileForm.get('phone')?.value || 'Not set' }}</span>
              </div>
              <div class="new-value" *ngIf="isEditing">
                <span class="value-label">New:</span>
                <mat-form-field appearance="fill">
                  <input matInput formControlName="newPhone" placeholder="Enter new phone number">
                </mat-form-field>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="action-buttons" *ngIf="isEditing">
            <button mat-button color="warn" (click)="cancelEditing()">Cancel</button>
            <button mat-raised-button color="primary" 
                    (click)="saveChanges()"
                    [disabled]="!isFormValid()">
              Save All Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem;
      min-height: calc(100vh - 64px);
      background-color: #1e1e1e;
    }
    .profile-card {
      background-color: #2d2d2d;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      width: 100%;
      max-width: 600px;
    }
    h2 {
      color: #ffffff;
      margin-bottom: 2rem;
      text-align: center;
      font-size: 1.8rem;
    }
    .profile-field {
      background-color: #363636;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .field-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .field-label {
      color: #9e9e9e;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .field-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .current-value, .new-value {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .value-label {
      color: #9e9e9e;
      min-width: 70px;
    }
    .field-value {
      color: #ffffff;
      font-size: 1.1rem;
    }
    .edit-button {
      color: #69f0ae;
    }
    mat-form-field {
      flex: 1;
    }
    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 2rem;
    }
    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }
    ::ng-deep .mat-mdc-form-field-focus-overlay {
      background-color: rgba(255, 255, 255, 0.04);
    }
    ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: #424242 !important;
    }
    ::ng-deep .mdc-text-field--filled:not(.mdc-text-field--disabled) {
      background-color: #424242;
    }
    ::ng-deep .mat-mdc-form-field-flex {
      background-color: #424242 !important;
    }
    ::ng-deep .error-snackbar {
      background-color: #f44336;
      color: white;
    }
    ::ng-deep .error-snackbar .mat-simple-snackbar-action {
      color: white;
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  loading = false;
  isEditing = false;
  private originalValues: any = {};

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      currentUsername: ['', Validators.required],
      newUsername: [''],
      email: ['', [Validators.email]],
      newEmail: ['', [Validators.email]],
      phone: [''],
      newPhone: ['']
    });
  }

  ngOnInit() {
    this.loading = true;
    const username = localStorage.getItem('username') || '';
    
    this.profileService.getUserProfile(username).subscribe({
      next: (profile: UserProfile) => {
        this.profileForm.patchValue({
          currentUsername: profile.username,
          email: profile.email,
          phone: profile.phone,
          newUsername: '',
          newEmail: '',
          newPhone: ''
        });
        this.originalValues = {
          currentUsername: profile.username,
          email: profile.email,
          phone: profile.phone
        };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching profile:', error);
        this.snackBar.open('Error loading profile', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  startEditing() {
    this.isEditing = true;
    this.profileForm.patchValue({
      newUsername: '',
      newEmail: '',
      newPhone: ''
    });
  }

  cancelEditing() {
    this.isEditing = false;
    this.profileForm.patchValue({
      newUsername: '',
      newEmail: this.originalValues.email,
      newPhone: this.originalValues.phone
    });
  }

  isFormValid(): boolean {
    if (!this.isEditing) return false;
    
    const formValues = this.profileForm.value;
    const hasValidChanges = 
      (formValues.newUsername && formValues.newUsername !== formValues.currentUsername) ||
      (formValues.newEmail && formValues.newEmail !== formValues.email && !this.profileForm.get('newEmail')?.errors) ||
      (formValues.newPhone && formValues.newPhone !== formValues.phone);
    
    return hasValidChanges;
  }

  saveChanges() {
    if (this.isFormValid()) {
      const formValues = this.profileForm.value;
      const updateRequest: UpdateProfileRequest = {
        username: formValues.currentUsername,
        newUsername: formValues.newUsername || undefined,
        newEmail: formValues.newEmail || undefined,
        phone: formValues.newPhone || undefined
      };

      // Remove undefined fields
      Object.keys(updateRequest).forEach(key => {
        if (updateRequest[key as keyof UpdateProfileRequest] === undefined) {
          delete updateRequest[key as keyof UpdateProfileRequest];
        }
      });

      this.loading = true;
      this.profileService.updateProfile(updateRequest).subscribe({
        next: (response) => {
          if (updateRequest.newUsername) {
            // Show success message before logout
            this.snackBar.open('Username updated successfully. Please login again.', 'Close', { duration: 3000 });
            
            // Small delay to ensure the message is seen
            setTimeout(() => {
              // Clear all stored data
              localStorage.clear();
              // Log out the user
              this.authService.logout();
              // Navigate to login page
              this.router.navigate(['/login']);
            }, 2000);
            
            return; // Exit early as we're logging out
          }

          // Handle other updates (email, phone) without logout
          if (updateRequest.newEmail) {
            this.profileForm.patchValue({ 
              email: updateRequest.newEmail,
              newEmail: ''
            });
          }
          if (updateRequest.phone !== undefined) {
            this.profileForm.patchValue({ 
              phone: updateRequest.phone,
              newPhone: ''
            });
          }
          
          this.originalValues = {
            currentUsername: this.profileForm.value.currentUsername,
            email: this.profileForm.value.email,
            phone: this.profileForm.value.phone
          };
          
          this.isEditing = false;
          this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          
          // Check if it's an HttpErrorResponse and has status 400
          if (error?.status === 400) {
            let errorMessage = 'One of the fields you changed was already used in the website';
            let fieldToReset = '';

            // Determine which field was being updated and set appropriate message
            if (updateRequest.newUsername) {
              errorMessage = 'This username is already taken. Please choose another username.';
              fieldToReset = 'newUsername';
            } else if (updateRequest.newEmail) {
              errorMessage = 'This email is already registered. Please use a different email.';
              fieldToReset = 'newEmail';
            } else if (updateRequest.phone) {
              errorMessage = 'This phone number is already registered. Please use a different number.';
              fieldToReset = 'newPhone';
            }

            // Show the error message with error-snackbar style
            this.snackBar.open(errorMessage, 'Close', { 
              duration: 5000,
              panelClass: ['error-snackbar']
            });

            // Clear only the field that caused the error
            if (fieldToReset) {
              this.profileForm.patchValue({ [fieldToReset]: '' });
            }
          } else {
            // Keep generic error message for other types of errors
            this.snackBar.open('Error updating profile', 'Close', { 
              duration: 3000,
              panelClass: ['error-snackbar']
            });
            this.cancelEditing();
          }
          
          this.loading = false;
        }
      });
    }
  }
} 