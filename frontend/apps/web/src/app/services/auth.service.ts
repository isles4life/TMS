import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export type UserRole = 'SuperAdmin' | 'Broker' | 'Carrier';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  carrierId?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface ImpersonationData {
  actualUser: User;
  impersonatedUser: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private impersonationSubject = new BehaviorSubject<ImpersonationData | null>(this.getImpersonationFromStorage());
  public impersonation$ = this.impersonationSubject.asObservable();
  private http = inject(HttpClient);

  login(email: string, password: string): Observable<LoginResponse> {
    // Demo credentials for offline testing
    const DEMO_CREDENTIALS: Record<string, { password: string; role: UserRole; firstName: string }> = {
      'superadmin@example.com': { password: 'admin123', role: 'SuperAdmin', firstName: 'Super' },
      'broker@example.com': { password: 'broker123', role: 'Broker', firstName: 'Broker' },
      'carrier@example.com': { password: 'carrier123', role: 'Carrier', firstName: 'Carrier' },
      'test@example.com': { password: 'password123', role: 'Carrier', firstName: 'Test' },
      'test@test.com': { password: 'password123', role: 'Broker', firstName: 'Test' },
      'demo@example.com': { password: 'demo123', role: 'Carrier', firstName: 'Demo' }
    };

    // Check if using demo credentials
    const credentials = DEMO_CREDENTIALS[email];
    if (credentials && credentials.password === password) {
      const demoUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: email,
        firstName: credentials.firstName,
        lastName: 'User',
        role: credentials.role,
        carrierId: credentials.role !== 'SuperAdmin' ? '456' : undefined
      };
      
      const response: LoginResponse = {
        success: true,
        message: 'Login successful (demo)',
        token: 'demo-token-' + Date.now(),
        user: demoUser
      };

      localStorage.setItem('authToken', response.token!);
      localStorage.setItem('user', JSON.stringify(demoUser));
      this.currentUserSubject.next(demoUser);

      return of(response);
    }

    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          if (response.success && response.token && response.user) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.currentUserSubject.next(response.user);
          }
        }),
        catchError(() => {
          // If backend is not available and credentials don't match demo, return error
          return of({
            success: false,
            message: 'Invalid email or password'
          });
        })
      );
  }

  register(email: string, password: string, firstName: string, lastName: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/register`, {
      email,
      password,
      firstName,
      lastName
    }).pipe(
      tap(response => {
        if (response.success && response.token && response.user) {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('impersonation');
    this.currentUserSubject.next(null);
    this.impersonationSubject.next(null);
  }

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(user);
  }

  setImpersonation(data: ImpersonationData | null): void {
    if (data) {
      localStorage.setItem('impersonation', JSON.stringify(data));
    } else {
      localStorage.removeItem('impersonation');
    }
    this.impersonationSubject.next(data);
  }

  getImpersonation(): ImpersonationData | null {
    return this.impersonationSubject.value;
  }

  endImpersonation(): void {
    const data = this.getImpersonationFromStorage();
    if (data?.actualUser) {
      this.setCurrentUser(data.actualUser);
    }
    this.setImpersonation(null);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  private getImpersonationFromStorage(): ImpersonationData | null {
    const data = localStorage.getItem('impersonation');
    return data ? JSON.parse(data) : null;
  }

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
}
