import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check role directly from localStorage
  const role = localStorage.getItem('role');
  console.log('Admin Guard - Current role:', role);

  if (role === 'ADMIN') {
    console.log('Admin Guard - Access granted');
    return true;
  }

  console.log('Admin Guard - Access denied, redirecting to login');
  router.navigate(['/login']);
  return false;
};
