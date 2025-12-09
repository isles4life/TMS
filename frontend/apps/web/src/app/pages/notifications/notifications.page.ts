import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { NotificationService, Notification } from '../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule
  ],
  template: `
    <div class="notifications-container">
      <div class="page-header">
        <h1>Notifications</h1>
        <div class="header-actions">
          <button mat-button (click)="markAllAsRead()" *ngIf="unreadNotifications.length > 0">
            <mat-icon>done_all</mat-icon>
            Mark all as read
          </button>
          <button mat-button color="warn" (click)="clearAll()" *ngIf="notifications.length > 0">
            <mat-icon>delete_sweep</mat-icon>
            Clear all
          </button>
        </div>
      </div>

      <mat-tab-group class="notifications-tabs">
        <mat-tab label="All ({{ notifications.length }})">
          <div class="notifications-list">
            <div *ngIf="notifications.length === 0" class="empty-state">
              <mat-icon>notifications_none</mat-icon>
              <p>No notifications</p>
            </div>
            <mat-card *ngFor="let notification of notifications" 
                     class="notification-card"
                     [class.unread]="!notification.read"
                     (click)="handleNotificationClick(notification)">
              <div class="notification-content">
                <div class="notification-icon" [ngClass]="'type-' + notification.type">
                  <mat-icon>{{ getNotificationIcon(notification.type) }}</mat-icon>
                </div>
                <div class="notification-body">
                  <div class="notification-header">
                    <h3>{{ notification.title }}</h3>
                    <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
                  </div>
                  <p>{{ notification.message }}</p>
                  <mat-chip-set *ngIf="notification.category">
                    <mat-chip>{{ notification.category }}</mat-chip>
                  </mat-chip-set>
                </div>
                <div class="notification-actions">
                  <button mat-icon-button (click)="toggleRead(notification, $event)">
                    <mat-icon>{{ notification.read ? 'mark_as_unread' : 'mark_as_read' }}</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteNotification(notification, $event)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Unread ({{ unreadNotifications.length }})">
          <div class="notifications-list">
            <div *ngIf="unreadNotifications.length === 0" class="empty-state">
              <mat-icon>mark_email_read</mat-icon>
              <p>No unread notifications</p>
            </div>
            <mat-card *ngFor="let notification of unreadNotifications" 
                     class="notification-card unread"
                     (click)="handleNotificationClick(notification)">
              <div class="notification-content">
                <div class="notification-icon" [ngClass]="'type-' + notification.type">
                  <mat-icon>{{ getNotificationIcon(notification.type) }}</mat-icon>
                </div>
                <div class="notification-body">
                  <div class="notification-header">
                    <h3>{{ notification.title }}</h3>
                    <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
                  </div>
                  <p>{{ notification.message }}</p>
                  <mat-chip-set *ngIf="notification.category">
                    <mat-chip>{{ notification.category }}</mat-chip>
                  </mat-chip-set>
                </div>
                <div class="notification-actions">
                  <button mat-icon-button (click)="toggleRead(notification, $event)">
                    <mat-icon>mark_as_read</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteNotification(notification, $event)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .notifications-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .page-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 500;
    }

    .header-actions {
      display: flex;
      gap: 12px;
    }

    .notifications-tabs {
      margin-top: 24px;
    }

    .notifications-list {
      padding: 24px 0;
      min-height: 400px;
    }

    .notification-card {
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
    }

    .notification-card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateY(-2px);
    }

    .notification-card:hover::after {
      content: '→';
      position: absolute;
      right: 80px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 24px;
      color: #1976d2;
      opacity: 0.6;
    }

    .notification-card.unread {
      background-color: #f0f7ff;
      border-left: 4px solid #1976d2;
    }

    .notification-content {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      padding: 8px;
    }

    .notification-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notification-icon.type-info {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .notification-icon.type-success {
      background-color: #e8f5e9;
      color: #4caf50;
    }

    .notification-icon.type-warning {
      background-color: #fff3e0;
      color: #ff9800;
    }

    .notification-icon.type-error {
      background-color: #ffebee;
      color: #f44336;
    }

    .notification-icon.type-load {
      background-color: #f3e5f5;
      color: #9c27b0;
    }

    .notification-body {
      flex: 1;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .notification-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .notification-time {
      font-size: 12px;
      color: #666;
      white-space: nowrap;
      margin-left: 12px;
    }

    .notification-body p {
      margin: 0 0 8px 0;
      color: #555;
      line-height: 1.5;
    }

    .notification-actions {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #999;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }

    .empty-state p {
      font-size: 18px;
      margin: 0;
    }

    mat-chip-set {
      margin-top: 8px;
    }

    mat-chip {
      font-size: 11px;
    }
  `]
})
export class NotificationsPage implements OnInit {
  notifications: Notification[] = [];
  unreadNotifications: Notification[] = [];

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadNotifications();
    // Mark all as read when page is viewed
    this.notificationService.markAllAsRead();
  }

  loadNotifications() {
    this.notifications = this.notificationService.getNotifications();
    this.unreadNotifications = this.notifications.filter(n => !n.read);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
    this.loadNotifications();
  }

  clearAll() {
    this.notificationService.clearAll();
    this.loadNotifications();
  }

  toggleRead(notification: Notification, event: Event) {
    event.stopPropagation();
    this.notificationService.toggleRead(notification.id);
    this.loadNotifications();
  }

  deleteNotification(notification: Notification, event: Event) {
    event.stopPropagation();
    this.notificationService.deleteNotification(notification.id);
    this.loadNotifications();
  }

  handleNotificationClick(notification: Notification) {
    // Mark as read
    if (!notification.read) {
      this.notificationService.markAsRead(notification.id);
      this.loadNotifications();
    }

    // Navigate to related page if link exists
    if (notification.link) {
      this.router.navigate([notification.link]);
    }
  }

  getNotificationIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'info': 'info',
      'success': 'check_circle',
      'warning': 'warning',
      'error': 'error',
      'load': 'local_shipping',
      'driver': 'person',
      'equipment': 'agriculture',
      'payment': 'payments'
    };
    return icons[type] || 'notifications';
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const notifDate = new Date(timestamp);
    const diffMs = now.getTime() - notifDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return notifDate.toLocaleDateString();
  }
}
