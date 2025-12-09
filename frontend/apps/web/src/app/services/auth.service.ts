import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  carrierId?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    // Demo credentials for offline testing
    const DEMO_CREDENTIALS = {
      'test@example.com': 'password123',
      'test@test.com': 'password123',
      'demo@example.com': 'demo123'
    };

    // Check if using demo credentials
    if (DEMO_CREDENTIALS[email as keyof typeof DEMO_CREDENTIALS] === password) {
      const demoUser: User = {
        id: '123',
        email: email,
        firstName: email === 'test@test.com' ? 'Test' : 'Demo',
        lastName: 'User',
        role: 'User',
        carrierId: '456'
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
        catchError(error => {
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
    this.currentUserSubject.next(null);
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

  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
}
