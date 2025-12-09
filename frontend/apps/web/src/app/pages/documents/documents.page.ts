import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DocumentService, Document } from '../../services/document.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDividerModule,
    MatTabsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatSnackBarModule
  ],
  template: `
    <div class="documents-container">
      <div class="page-header">
        <h1>Documents</h1>
        <p class="subtitle">Upload and manage your documents</p>
      </div>

      <mat-tab-group class="documents-tabs">
        <mat-tab label="Upload Documents">
          <div class="upload-section">
            <mat-card class="upload-card">
              <div class="upload-dropzone" 
                   (drop)="onDrop($event)" 
                   (dragover)="onDragOver($event)"
                   (dragleave)="onDragLeave($event)"
                   [class.dragover]="isDragging">
                <mat-icon class="upload-icon">cloud_upload</mat-icon>
                <h3>Drag and drop files here</h3>
                <p>or click to browse</p>
                <input type="file" 
                       #fileInput 
                       hidden 
                       multiple 
                       (change)="onFileSelected($event)"
                       accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip">
                <button mat-raised-button color="primary" (click)="fileInput.click()">
                  <mat-icon>attach_file</mat-icon>
                  Select Files
                </button>
              </div>
            </mat-card>

            <mat-card class="upload-form-card">
              <h3>Document Details</h3>
              <form [formGroup]="uploadForm" (ngSubmit)="uploadDocument()">
                <mat-form-field appearance="fill" class="full-width">
                  <mat-label>Document Type</mat-label>
                  <mat-select formControlName="type">
                    <mat-option value="proof-of-delivery">Proof of Delivery</mat-option>
                    <mat-option value="bill-of-lading">Bill of Lading</mat-option>
                    <mat-option value="invoice">Invoice</mat-option>
                    <mat-option value="manifest">Manifest</mat-option>
                    <mat-option value="license">License/Permit</mat-option>
                    <mat-option value="inspection">Inspection Report</mat-option>
                    <mat-option value="other">Other</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="fill" class="full-width">
                  <mat-label>Related Load (Optional)</mat-label>
                  <input matInput formControlName="loadId" placeholder="Load #12345">
                </mat-form-field>

                <mat-form-field appearance="fill" class="full-width">
                  <mat-label>Notes</mat-label>
                  <textarea matInput formControlName="notes" placeholder="Add any notes about this document"></textarea>
                </mat-form-field>

                <div class="selected-files">
                  <h4 *ngIf="selectedFiles.length > 0">Selected Files ({{ selectedFiles.length }})</h4>
                  <div *ngFor="let file of selectedFiles" class="file-item">
                    <mat-icon>description</mat-icon>
                    <div class="file-info">
                      <span class="file-name">{{ file.name }}</span>
                      <span class="file-size">{{ formatFileSize(file.size) }}</span>
                    </div>
                    <button mat-icon-button type="button" (click)="removeFile(file)">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                </div>

                <div class="form-actions">
                  <button mat-raised-button color="primary" 
                          [disabled]="selectedFiles.length === 0"
                          type="submit">
                    <mat-icon>upload</mat-icon>
                    Upload {{ selectedFiles.length }} {{ selectedFiles.length === 1 ? 'File' : 'Files' }}
                  </button>
                  <button mat-stroked-button type="button" (click)="clearForm()">
                    <mat-icon>clear</mat-icon>
                    Clear
                  </button>
                </div>
              </form>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Uploaded Documents ({{ documents.length }})">
          <div class="documents-list">
            <div *ngIf="documents.length === 0" class="empty-state">
              <mat-icon>folder_open</mat-icon>
              <p>No documents uploaded yet</p>
            </div>

            <div *ngFor="let doc of documents" class="document-item">
              <mat-card>
                <div class="document-header">
                  <div class="document-info">
                    <mat-icon class="doc-icon">
                      {{ getDocumentIcon(doc.type) }}
                    </mat-icon>
                    <div class="doc-details">
                      <h4>{{ doc.filename }}</h4>
                      <p class="doc-type">{{ formatDocType(doc.type) }}</p>
                    </div>
                  </div>
                  <div class="document-meta">
                    <span class="doc-size">{{ formatFileSize(doc.size) }}</span>
                    <span class="doc-date">{{ formatDate(doc.uploadDate) }}</span>
                    <mat-chip-set>
                      <mat-chip [ngClass]="'status-' + doc.status">
                        {{ doc.status | titlecase }}
                      </mat-chip>
                    </mat-chip-set>
                  </div>
                </div>

                <mat-divider></mat-divider>

                <div class="document-body" *ngIf="doc.notes">
                  <p><strong>Notes:</strong> {{ doc.notes }}</p>
                </div>

                <div class="document-body" *ngIf="doc.loadId">
                  <p><strong>Related Load:</strong> #{{ doc.loadId }}</p>
                </div>

                <div class="document-actions">
                  <button mat-button color="primary">
                    <mat-icon>download</mat-icon>
                    Download
                  </button>
                  <button mat-button color="primary">
                    <mat-icon>preview</mat-icon>
                    Preview
                  </button>
                  <button mat-button color="warn">
                    <mat-icon>delete</mat-icon>
                    Delete
                  </button>
                </div>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Pending Uploads">
          <div class="documents-list">
            <div *ngIf="pendingNotifications.length === 0" class="empty-state">
              <mat-icon>done_all</mat-icon>
              <p>No pending document uploads</p>
            </div>

            <div *ngFor="let notif of pendingNotifications" class="pending-item">
              <mat-card>
                <div class="pending-header">
                  <div class="pending-info">
                    <mat-icon class="warning-icon">warning</mat-icon>
                    <div class="pending-details">
                      <h4>{{ notif.title }}</h4>
                      <p class="pending-message">{{ notif.message }}</p>
                    </div>
                  </div>
                  <span class="pending-time">{{ formatTime(notif.timestamp) }}</span>
                </div>

                <div class="pending-actions">
                  <button mat-raised-button color="accent" (click)="goToDocumentUpload(notif)">
                    <mat-icon>upload</mat-icon>
                    Upload Document
                  </button>
                  <button mat-button (click)="markNotificationRead(notif)">
                    <mat-icon>done</mat-icon>
                    Mark as Done
                  </button>
                </div>
              </mat-card>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .documents-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .page-header h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 500;
    }

    .subtitle {
      margin: 0;
      color: #666;
      font-size: 14px;
    }

    .documents-tabs {
      margin-top: 24px;
    }

    .upload-section {
      padding: 24px 0;
    }

    .upload-card, .upload-form-card {
      margin-bottom: 24px;
    }

    .upload-dropzone {
      border: 2px dashed #ccc;
      border-radius: 8px;
      padding: 40px 20px;
      text-align: center;
      transition: all 0.3s ease;
      cursor: pointer;
      background-color: #fafafa;
    }

    .upload-dropzone:hover {
      border-color: #1976d2;
      background-color: #f0f7ff;
    }

    .upload-dropzone.dragover {
      border-color: #1976d2;
      background-color: #e3f2fd;
      box-shadow: 0 0 0 8px rgba(25, 118, 210, 0.1);
    }

    .upload-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: #1976d2;
      margin-bottom: 16px;
    }

    .upload-dropzone h3 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 500;
    }

    .upload-dropzone p {
      margin: 0 0 16px 0;
      color: #666;
    }

    .upload-form-card h3 {
      margin-top: 0;
      font-size: 18px;
      font-weight: 500;
    }

    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }

    .selected-files {
      margin: 24px 0;
    }

    .selected-files h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 500;
      color: #666;
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background-color: #f5f5f5;
      border-radius: 4px;
      margin-bottom: 8px;
    }

    .file-item mat-icon {
      color: #1976d2;
      flex-shrink: 0;
    }

    .file-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .file-name {
      font-weight: 500;
      font-size: 14px;
    }

    .file-size {
      font-size: 12px;
      color: #999;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .documents-list {
      padding: 24px 0;
      min-height: 400px;
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

    .document-item {
      margin-bottom: 16px;
    }

    .document-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 8px;
    }

    .document-info {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex: 1;
    }

    .doc-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #1976d2;
      flex-shrink: 0;
    }

    .doc-details h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .doc-type {
      margin: 0;
      font-size: 12px;
      color: #666;
    }

    .document-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 8px;
    }

    .doc-size {
      font-size: 12px;
      color: #999;
    }

    .doc-date {
      font-size: 12px;
      color: #999;
    }

    .document-body {
      padding: 12px 8px;
      font-size: 14px;
    }

    .document-body p {
      margin: 0;
    }

    .document-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-start;
      padding-top: 12px;
    }

    .pending-item {
      margin-bottom: 16px;
    }

    .pending-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 8px;
    }

    .pending-info {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      flex: 1;
    }

    .warning-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #ff9800;
      flex-shrink: 0;
    }

    .pending-details h4 {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 500;
    }

    .pending-message {
      margin: 0;
      font-size: 14px;
      color: #666;
    }

    .pending-time {
      font-size: 12px;
      color: #999;
      white-space: nowrap;
      margin-left: 12px;
    }

    .pending-actions {
      display: flex;
      gap: 12px;
      padding-top: 12px;
    }

    mat-chip-set {
      display: inline-flex;
    }

    mat-chip {
      font-size: 11px;
    }

    mat-chip.status-pending {
      background-color: #fff3e0 !important;
      color: #e65100 !important;
    }

    mat-chip.status-verified {
      background-color: #e8f5e9 !important;
      color: #2e7d32 !important;
    }

    mat-chip.status-rejected {
      background-color: #ffebee !important;
      color: #c62828 !important;
    }
  `]
})
export class DocumentsPage implements OnInit {
  uploadForm: FormGroup;
  documents: Document[] = [];
  selectedFiles: File[] = [];
  isDragging = false;
  pendingNotifications: any[] = [];

  constructor(
    private fb: FormBuilder,
    private documentService: DocumentService,
    private notificationService: NotificationService,
    private snackBar: MatSnackBar
  ) {
    this.uploadForm = this.fb.group({
      type: ['', Validators.required],
      loadId: [''],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadDocuments();
    this.loadPendingNotifications();
  }

  loadDocuments() {
    this.documents = this.documentService.getDocuments();
  }

  loadPendingNotifications() {
    const allNotifications = this.notificationService.getNotifications();
    this.pendingNotifications = allNotifications.filter(n => 
      n.type === 'warning' && n.category === 'Documents' && !n.read
    );
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.addFiles(Array.from(files));
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(Array.from(input.files));
    }
  }

  addFiles(files: File[]) {
    this.selectedFiles.push(...files);
  }

  removeFile(file: File) {
    this.selectedFiles = this.selectedFiles.filter(f => f !== file);
  }

  uploadDocument() {
    if (this.uploadForm.invalid || this.selectedFiles.length === 0) {
      return;
    }

    const formValue = this.uploadForm.value;
    this.selectedFiles.forEach(file => {
      const document = this.documentService.addDocument({
        filename: file.name,
        size: file.size,
        type: formValue.type,
        loadId: formValue.loadId || undefined,
        notes: formValue.notes || undefined,
        status: 'pending'
      });

      // Add notification for upload
      this.notificationService.addNotification({
        title: 'Document Uploaded',
        message: `${file.name} has been uploaded and is pending verification.`,
        type: 'success',
        category: 'Documents',
        link: '/documents'
      });
    });

    this.snackBar.open(`Successfully uploaded ${this.selectedFiles.length} document(s)`, 'Close', {
      duration: 4000
    });

    this.clearForm();
    this.loadDocuments();
  }

  clearForm() {
    this.uploadForm.reset();
    this.selectedFiles = [];
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
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

  formatDocType(type: string): string {
    return type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

  getDocumentIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'proof-of-delivery': 'check_circle',
      'bill-of-lading': 'receipt',
      'invoice': 'receipt_long',
      'manifest': 'assignment',
      'license': 'badge',
      'inspection': 'assessment',
      'other': 'description'
    };
    return icons[type] || 'description';
  }

  goToDocumentUpload(notification: any) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  markNotificationRead(notification: any) {
    this.notificationService.markAsRead(notification.id);
    this.loadPendingNotifications();
    this.snackBar.open('Marked as done', 'Close', { duration: 2000 });
  }
}
