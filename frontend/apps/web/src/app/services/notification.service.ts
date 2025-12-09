import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'load' | 'driver' | 'equipment' | 'payment';
  category?: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: Notification[] = [];
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    this.loadNotifications();
    this.generateMockNotifications();
  }

  private loadNotifications() {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      this.notifications = JSON.parse(stored).map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
    }
    this.updateUnreadCount();
  }

  private saveNotifications() {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
    this.updateUnreadCount();
  }

  private updateUnreadCount() {
    const count = this.notifications.filter(n => !n.read).length;
    this.unreadCountSubject.next(count);
  }

  getNotifications(): Notification[] {
    return [...this.notifications].sort((a, b) => 
      b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };
    this.notifications.unshift(newNotification);
    this.saveNotifications();
  }

  markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }

  toggleRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = !notification.read;
      this.saveNotifications();
    }
  }

  deleteNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
  }

  clearAll() {
    this.notifications = [];
    this.saveNotifications();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private generateMockNotifications() {
    // Only generate if no notifications exist
    if (this.notifications.length === 0) {
      const mockNotifications: Omit<Notification, 'id'>[] = [
        {
          title: 'New Load Available',
          message: 'Load #12345 from Chicago to New York is available for pickup.',
          type: 'load',
          category: 'Dispatch',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          read: false,
          link: '/load-board'
        },
        {
          title: 'Driver Status Update',
          message: 'John Smith has completed delivery for Load #12340.',
          type: 'success',
          category: 'Drivers',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
          read: false,
          link: '/dashboard'
        },
        {
          title: 'Equipment Maintenance Due',
          message: 'Truck #456 requires scheduled maintenance within 3 days.',
          type: 'warning',
          category: 'Equipment',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
          read: false,
          link: '/dashboard'
        },
        {
          title: 'Payment Received',
          message: 'Invoice #INV-2024-001 has been paid - $4,250.00',
          type: 'payment',
          category: 'Accounting',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
          read: true,
          link: '/dashboard'
        },
        {
          title: 'Load Assignment',
          message: 'You have been assigned to Load #12347 - Chicago to Dallas.',
          type: 'info',
          category: 'Dispatch',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
          read: true,
          link: '/load-board'
        },
        {
          title: 'Document Upload Required',
          message: 'Please upload proof of delivery for Load #12340.',
          type: 'warning',
          category: 'Documents',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
          read: true,
          link: '/documents'
        },
        {
          title: 'New Driver Onboarded',
          message: 'Sarah Johnson has completed onboarding and is ready for assignments.',
          type: 'success',
          category: 'Drivers',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
          read: true,
          link: '/dashboard'
        },
        {
          title: 'System Maintenance',
          message: 'Scheduled system maintenance on Dec 15, 2025 from 2AM-4AM EST.',
          type: 'info',
          category: 'System',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
          read: true,
          link: '/settings'
        },
        {
          title: 'Document Uploaded',
          message: 'POD_Load_12345.pdf has been uploaded and is pending verification.',
          type: 'success',
          category: 'Documents',
          timestamp: new Date(Date.now() - 1000 * 60 * 5),
          read: false,
          link: '/documents'
        }
      ];

      mockNotifications.forEach(notif => {
        this.notifications.push({
          ...notif,
          id: this.generateId()
        });
      });

      this.saveNotifications();
    }
  }
}
