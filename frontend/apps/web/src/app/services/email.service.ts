import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  type: 'welcome' | 'password-reset' | 'notification';
}

export interface EmailResponse {
  success: boolean;
  message: string;
  emailId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  private apiUrl = 'http://localhost:5000/api/email';

  constructor(private http: HttpClient) {}

  sendWelcomeEmail(email: string, firstName: string, lastName: string, tempPassword: string): Observable<EmailResponse> {
    console.log('📧 Sending welcome email to:', email);
    
    // Call backend welcome email endpoint
    return this.http.post<EmailResponse>(`${this.apiUrl}/send-welcome`, {
      email,
      firstName,
      lastName,
      tempPassword
    });
  }

  sendPasswordResetEmail(email: string, firstName: string, resetToken: string): Observable<EmailResponse> {
    console.log('📧 Sending password reset email to:', email);
    
    // Call backend password reset email endpoint
    return this.http.post<EmailResponse>(`${this.apiUrl}/send-reset`, {
      email,
      firstName,
      resetToken
    });
  }

  sendEmail(request: EmailRequest): Observable<EmailResponse> {
    console.log('📧 Sending email via backend:', {
      to: request.to,
      subject: request.subject,
      type: request.type
    });

    // Make real HTTP call to backend
    return this.http.post<EmailResponse>(`${this.apiUrl}/send`, request);
  }
}
