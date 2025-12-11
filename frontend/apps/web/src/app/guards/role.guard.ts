import { Injectable, inject } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export type UserRole = 'SuperAdmin' | 'Broker' | 'Carrier';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.router.navigate(['/login']);
      return false;
    }

    // Check if route requires specific roles
    const requiredRoles = route.data['roles'] as UserRole[] | undefined;

    if (requiredRoles && requiredRoles.length > 0) {
      if (!requiredRoles.includes(currentUser.role as UserRole)) {
        // User doesn't have required role, redirect to dashboard
        this.router.navigate(['/dashboard']);
        return false;
      }
    }

    return true;
  }
}
