import { Component, OnInit, inject } from '@angular/core';
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
            <div class="upload-grid">
              <mat-card class="upload-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>cloud_upload</mat-icon>
                    Upload Files
                  </mat-card-title>
                  <mat-card-subtitle>Drag & drop or click to select</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <div class="upload-dropzone" 
                       (drop)="onDrop($event)" 
                       (dragover)="onDragOver($event)"
                       (dragleave)="onDragLeave($event)"
                       [class.dragover]="isDragging">
                    <mat-icon class="upload-icon">cloud_upload</mat-icon>
                    <h3>Drop files here</h3>
                    <p>Supports PDF, DOC, XLS, images and ZIP files</p>
                    <input type="file" 
                           #fileInput 
                           hidden 
                           multiple 
                           (change)="onFileSelected($event)"
                           accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip">
                    <button mat-raised-button color="primary" (click)="fileInput.click()">
                      <mat-icon>attach_file</mat-icon>
                      Browse Files
                    </button>
                  </div>
                </mat-card-content>
              </mat-card>

              <mat-card class="upload-form-card">
                <mat-card-header>
                  <mat-card-title>
                    <mat-icon>description</mat-icon>
                    Document Information
                  </mat-card-title>
                  <mat-card-subtitle>Provide details about your documents</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content>
                  <form [formGroup]="uploadForm" (ngSubmit)="uploadDocument()">
                    <div class="form-grid">
                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Document Type</mat-label>
                        <mat-select formControlName="type">
                          <mat-option value="proof-of-delivery">
                            <mat-icon>check_circle</mat-icon>
                            Proof of Delivery
                          </mat-option>
                          <mat-option value="bill-of-lading">
                            <mat-icon>receipt_long</mat-icon>
                            Bill of Lading
                          </mat-option>
                          <mat-option value="invoice">
                            <mat-icon>receipt</mat-icon>
                            Invoice
                          </mat-option>
                          <mat-option value="manifest">
                            <mat-icon>list_alt</mat-icon>
                            Manifest
                          </mat-option>
                          <mat-option value="license">
                            <mat-icon>card_membership</mat-icon>
                            License/Permit
                          </mat-option>
                          <mat-option value="inspection">
                            <mat-icon>fact_check</mat-icon>
                            Inspection Report
                          </mat-option>
                          <mat-option value="other">
                            <mat-icon>description</mat-icon>
                            Other
                          </mat-option>
                        </mat-select>
                      </mat-form-field>

                      <mat-form-field appearance="outline" class="full-width">
                        <mat-label>Related Load</mat-label>
                        <input matInput formControlName="loadId" placeholder="e.g., 12345">
                        <mat-icon matPrefix>local_shipping</mat-icon>
                        <mat-hint>Optional - Link to a load number</mat-hint>
                      </mat-form-field>
                    </div>

                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Notes</mat-label>
                      <textarea matInput formControlName="notes" rows="3" placeholder="Add any relevant notes or comments"></textarea>
                      <mat-icon matPrefix>note</mat-icon>
                    </mat-form-field>

                    <div class="selected-files">
                      @if (selectedFiles.length > 0) {
                        <div class="files-header">
                          <h4>
                            <mat-icon>attach_file</mat-icon>
                            Selected Files ({{ selectedFiles.length }})
                          </h4>
                          <button mat-button type="button" (click)="clearFiles()" class="clear-all-btn">
                            <mat-icon>clear_all</mat-icon>
                            Clear All
                          </button>
                        </div>
                        @for (file of selectedFiles; track file.name) {
                          <div class="file-item">
                            <div class="file-icon-wrapper">
                              <mat-icon>{{ getFileIcon(file.name) }}</mat-icon>
                            </div>
                            <div class="file-info">
                              <span class="file-name">{{ file.name }}</span>
                              <span class="file-size">{{ formatFileSize(file.size) }}</span>
                            </div>
                            <button mat-icon-button type="button" (click)="removeFile(file)" class="remove-btn">
                              <mat-icon>close</mat-icon>
                            </button>
                          </div>
                        }
                      } @else {
                        <div class="no-files">
                          <mat-icon>info</mat-icon>
                          <p>No files selected yet</p>
                        </div>
                      }
                    </div>

                    <div class="form-actions">
                      <button mat-raised-button color="primary" 
                              [disabled]="selectedFiles.length === 0 || uploadForm.invalid"
                              type="submit">
                        <mat-icon>cloud_upload</mat-icon>
                        Upload {{ selectedFiles.length > 0 ? selectedFiles.length + ' ' + (selectedFiles.length === 1 ? 'File' : 'Files') : 'Documents' }}
                      </button>
                      <button mat-stroked-button type="button" (click)="clearForm()" [disabled]="selectedFiles.length === 0">
                        <mat-icon>refresh</mat-icon>
                        Reset Form
                      </button>
                    </div>
                  </form>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Uploaded Documents ({{ documents.length }})">
          <div class="documents-list">
            @if (documents.length === 0) {
              <div class="empty-state">
                <mat-icon>folder_open</mat-icon>
                <p>No documents uploaded yet</p>
              </div>
            }

            @for (doc of documents; track doc.filename) {
              <div class="document-item">
                <mat-card class="document-card">
                  <mat-card-header>
                    <div class="header-left">
                      <mat-icon class="doc-icon">
                        {{ getDocumentIcon(doc.type) }}
                      </mat-icon>
                      <div class="doc-details">
                        <mat-card-title>{{ doc.filename }}</mat-card-title>
                        <mat-card-subtitle>{{ formatDocType(doc.type) }}</mat-card-subtitle>
                      </div>
                    </div>
                    <div class="header-right">
                      <mat-chip-set>
                        <mat-chip [ngClass]="'status-' + doc.status">
                          {{ doc.status | titlecase }}
                        </mat-chip>
                      </mat-chip-set>
                    </div>
                  </mat-card-header>

                  <mat-card-content>
                    <div class="document-details">
                      <div class="detail-row">
                        <span class="label">Size</span>
                        <span class="value">{{ formatFileSize(doc.size) }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="label">Upload Date</span>
                        <span class="value">{{ formatDate(doc.uploadDate) }}</span>
                      </div>
                      @if (doc.loadId) {
                        <div class="detail-row">
                          <span class="label">Related Load</span>
                          <span class="value">#{{ doc.loadId }}</span>
                        </div>
                      }
                    </div>

                    @if (doc.notes) {
                      <div class="document-notes">
                        <div class="label">Notes</div>
                        <div class="value">{{ doc.notes }}</div>
                      </div>
                    }
                  </mat-card-content>

                  <mat-card-actions>
                    <button mat-button color="primary" (click)="downloadDocument(doc)">
                      <mat-icon>download</mat-icon>
                      Download
                    </button>
                    <button mat-button color="primary" (click)="previewDocument(doc)">
                      <mat-icon>preview</mat-icon>
                      Preview
                    </button>
                    <button mat-button color="warn" (click)="deleteDocument(doc)">
                      <mat-icon>delete</mat-icon>
                      Delete
                    </button>
                  </mat-card-actions>
                </mat-card>
              </div>
            }
          </div>
        </mat-tab>

        <mat-tab label="Pending Uploads">
          <div class="documents-list">
            @if (pendingNotifications.length === 0) {
              <div class="empty-state">
                <mat-icon>done_all</mat-icon>
                <p>No pending document uploads</p>
              </div>
            }

            @for (notif of pendingNotifications; track notif.title) {
              <div class="pending-item">
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
                    <button mat-raised-button color="accent" (click)="goToDocumentUpload()">
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
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .documents-container {
      padding: 1rem;
      box-sizing: border-box;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .page-header h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 500;
      color: var(--color-text, var(--ts-ink));
    }

    .subtitle {
      margin: 0;
      color: var(--muted-text, #666);
      font-size: 14px;
    }

    .documents-tabs {
      margin-top: 24px;
    }

    .upload-section {
      padding: 24px 0;
    }

    .upload-grid {
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      gap: 24px;
      align-items: start;

      @media (max-width: 1200px) {
        grid-template-columns: 1fr;
      }
    }

    .upload-card, .upload-form-card {
      background: var(--card-bg);
      color: var(--color-text);
      border: 3px solid var(--border-color);
      border-radius: 12px;
      box-shadow: 
        0 4px 12px rgba(0, 0, 0, 0.15), 
        0 2px 6px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: visible;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 5px;
        background: linear-gradient(180deg, var(--ts-red) 0%, #b31218 100%);
        opacity: 0.8;
        border-radius: 12px 0 0 12px;
      }

      &:hover {
        box-shadow: 
          0 8px 16px rgba(0, 0, 0, 0.18), 
          0 4px 8px rgba(0, 0, 0, 0.12),
          0 0 0 2px rgba(215, 25, 32, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.15);
        border-color: var(--ts-red);
        transform: translateY(-2px);

        &::before {
          width: 6px;
          opacity: 1;
        }
      }

      mat-card-header {
        display: flex;
        flex-direction: column;
        padding: 20px 24px 16px 28px;
        background: linear-gradient(135deg, 
          var(--card-bg) 0%, 
          var(--surface-secondary) 50%,
          var(--card-bg) 100%);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        border-bottom: 2px solid var(--border-color);
      }

      mat-card-title {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 20px;
        font-weight: 800;
        color: var(--color-text);
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        margin-bottom: 6px;

        mat-icon {
          color: var(--ts-red);
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }

      mat-card-subtitle {
        color: var(--muted-text);
        font-weight: 500;
        font-size: 14px;
        margin: 0;
        padding-left: 36px;
      }

      mat-card-content {
        padding: 28px 24px 28px 28px;
      }
    }

    .upload-dropzone {
      border: 3px dashed var(--border-color);
      border-radius: 12px;
      padding: 40px 24px;
      text-align: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      background: var(--surface-secondary);
      min-height: 320px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      h3 {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 700;
        color: var(--color-text);
      }

      p {
        margin: 0 0 20px 0;
        color: var(--muted-text);
        font-size: 13px;
        max-width: 250px;
      }

      button {
        margin-top: 4px;
      }
    }

    .upload-dropzone:hover {
      border-color: var(--ts-red);
      background: var(--card-bg);
      box-shadow: 
        0 4px 12px rgba(215, 25, 32, 0.08),
        inset 0 0 40px rgba(215, 25, 32, 0.03);
      transform: scale(1.01);
    }

    .upload-dropzone.dragover {
      border-color: var(--ts-red);
      border-width: 4px;
      background: linear-gradient(135deg, 
        rgba(215, 25, 32, 0.05) 0%, 
        rgba(215, 25, 32, 0.02) 100%);
      box-shadow: 
        0 8px 24px rgba(215, 25, 32, 0.15),
        0 0 0 6px rgba(215, 25, 32, 0.08),
        inset 0 0 60px rgba(215, 25, 32, 0.05);
      transform: scale(1.02);

      .upload-icon {
        animation: bounce 0.6s ease-in-out infinite;
      }
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .upload-icon {
      font-size: 56px;
      width: 56px;
      height: 56px;
      color: var(--ts-red);
      margin-bottom: 16px;
      transition: all 0.3s ease;
    }

    .upload-dropzone:hover .upload-icon {
      transform: scale(1.08);
      filter: drop-shadow(0 4px 8px rgba(215, 25, 32, 0.3));
    }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 16px;
      margin-bottom: 16px;
    }

    mat-form-field {
      &.full-width {
        width: 100%;
      }

      ::ng-deep {
        .mat-mdc-text-field-wrapper {
          background: var(--card-bg);
        }

        .mat-icon {
          color: var(--ts-red);
        }

        .mdc-notched-outline__leading,
        .mdc-notched-outline__notch,
        .mdc-notched-outline__trailing {
          border-color: var(--border-color) !important;
        }

        &.mat-focused {
          .mdc-notched-outline__leading,
          .mdc-notched-outline__notch,
          .mdc-notched-outline__trailing {
            border-color: var(--ts-red) !important;
            border-width: 2px !important;
          }
        }
      }
    }

    .selected-files {
      margin: 24px 0;
      padding: 20px;
      background: var(--surface-secondary);
      border-radius: 8px;
      border: 2px solid var(--border-color);

      .files-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 2px solid var(--border-color);

        h4 {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: var(--color-text);

          mat-icon {
            color: var(--ts-red);
            font-size: 20px;
            width: 20px;
            height: 20px;
          }
        }

        .clear-all-btn {
          font-size: 13px;
          font-weight: 600;
          color: var(--ts-red);
        }
      }

      .no-files {
        text-align: center;
        padding: 32px 16px;
        color: var(--muted-text);

        mat-icon {
          font-size: 48px;
          width: 48px;
          height: 48px;
          opacity: 0.3;
          margin-bottom: 12px;
        }

        p {
          margin: 0;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }

    .file-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      background: var(--card-bg);
      border: 2px solid var(--border-color);
      border-left: 4px solid var(--ts-red);
      border-radius: 8px;
      margin-bottom: 8px;
      transition: all 0.2s ease;

      &:hover {
        transform: translateX(4px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
        border-color: var(--ts-red);
      }

      .file-icon-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, rgba(215, 25, 32, 0.1), rgba(215, 25, 32, 0.05));
        border-radius: 8px;
        flex-shrink: 0;

        mat-icon {
          color: var(--ts-red);
          font-size: 24px;
          width: 24px;
          height: 24px;
        }
      }

      .file-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;

        .file-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--color-text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .file-size {
          font-size: 12px;
          color: var(--muted-text);
          font-weight: 500;
        }
      }

      .remove-btn {
        flex-shrink: 0;
        color: var(--muted-text);
        transition: all 0.2s ease;

        &:hover {
          color: var(--ts-red);
          background: rgba(215, 25, 32, 0.1);
        }
      }
    }

    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 28px;
      padding-top: 20px;
      border-top: 2px solid var(--border-color);

      button {
        flex: 1;
        font-weight: 600;
        padding: 12px 20px;
        border-radius: 8px;
        transition: all 0.2s ease;
        height: 48px;

        mat-icon {
          margin-right: 6px;
        }

        &:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(215, 25, 32, 0.2);
        }

        &:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }

      @media (max-width: 600px) {
        flex-direction: column;

        button {
          width: 100%;
        }
      }
    }

    .documents-list {
      padding: 24px 0;
      min-height: 400px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(600px, 1fr));
      gap: 24px;
      align-items: start;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: var(--muted-text, #999);
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
      color: var(--muted-text, #999);
    }

    .empty-state p {
      font-size: 18px;
      margin: 0;
    }

    .document-item {
      .document-card {
        background: var(--card-bg);
        border: 3px solid var(--border-color);
        border-radius: 12px;
        box-shadow: 
          0 4px 12px rgba(0, 0, 0, 0.15), 
          0 2px 6px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.1);
        position: relative;
        overflow: hidden;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

        &::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 5px;
          background: linear-gradient(180deg, var(--ts-red) 0%, #b31218 100%);
          opacity: 0.8;
        }

        &:hover {
          box-shadow: 
            0 8px 16px rgba(0, 0, 0, 0.18), 
            0 4px 8px rgba(0, 0, 0, 0.12),
            0 0 0 2px rgba(215, 25, 32, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
          border-color: var(--ts-red);
          transform: translateY(-2px);

          &::before {
            width: 6px;
            opacity: 1;
          }
        }

        mat-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px 16px 28px;
          background: linear-gradient(135deg, 
            var(--card-bg) 0%, 
            var(--surface-secondary) 50%,
            var(--card-bg) 100%);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          border-bottom: 2px solid var(--border-color);

          .header-left {
            flex: 1;
            display: flex;
            align-items: center;
            gap: 16px;

            .doc-icon {
              font-size: 32px;
              width: 32px;
              height: 32px;
              color: var(--ts-red);
              flex-shrink: 0;
            }

            .doc-details {
              mat-card-title {
                font-size: 20px;
                font-weight: 800;
                margin-bottom: 4px;
                color: var(--color-text);
                text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
              }

              mat-card-subtitle {
                color: var(--muted-text);
                font-weight: 500;
                margin-top: 6px;
              }
            }
          }

          .header-right {
            mat-chip-set {
              mat-chip {
                font-weight: 600;
              }
            }
          }
        }

        mat-card-content {
          padding: 24px 24px 24px 28px;

          .document-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 16px;
            margin-bottom: 16px;

            .detail-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 0;
              border-bottom: 1px solid var(--border-color);

              .label {
                font-weight: 500;
                color: var(--muted-text);
                font-size: 13px;
              }

              .value {
                font-weight: 600;
                color: var(--color-text);
                text-align: right;
                font-size: 13px;
              }
            }
          }

          .document-notes {
            padding: 12px 16px;
            background: var(--card-bg);
            border-radius: 8px;
            border-left: 4px solid var(--ts-red);
            margin-top: 16px;

            .label {
              font-weight: 600;
              color: var(--muted-text);
              font-size: 12px;
              margin-bottom: 6px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .value {
              font-size: 14px;
              color: var(--color-text);
              line-height: 1.5;
            }
          }
        }

        mat-card-actions {
          display: flex;
          gap: 12px;
          padding: 16px 24px 16px 28px;
          border-top: 1px solid var(--border-color);
          background: var(--surface-secondary);
        }
      }
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
  pendingNotifications: { id: string; title: string; message: string; timestamp: Date }[] = [];

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
      this.documentService.addDocument({
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
    const icons: Record<string, string> = {
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

  getFileIcon(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const iconMap: Record<string, string> = {
      'pdf': 'picture_as_pdf',
      'doc': 'description',
      'docx': 'description',
      'xls': 'table_chart',
      'xlsx': 'table_chart',
      'jpg': 'image',
      'jpeg': 'image',
      'png': 'image',
      'gif': 'image',
      'zip': 'folder_zip'
    };
    return iconMap[ext] || 'description';
  }

  clearFiles() {
    this.selectedFiles = [];
  }

  goToDocumentUpload() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  markNotificationRead(notification: { id: string }) {
    this.notificationService.markAsRead(notification.id);
    this.loadPendingNotifications();
    this.snackBar.open('Marked as done', 'Close', { duration: 2000 });
  }

  downloadDocument(doc: any) {
    // For now, create a simple text file with document info
    const content = `Document: ${doc.filename}
Type: ${this.formatDocType(doc.type)}
Upload Date: ${this.formatDate(doc.uploadDate)}
${doc.loadId ? 'Load ID: ' + doc.loadId : ''}
${doc.notes ? 'Notes: ' + doc.notes : ''}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.filename;
    link.click();
    window.URL.revokeObjectURL(url);
    
    this.snackBar.open(`Downloading ${doc.filename}`, 'Close', { duration: 3000 });
  }

  previewDocument(doc: any) {
    // For preview, open document info in a new window
    const content = `
<!DOCTYPE html>
<html>
<head>
  <title>Document Preview - ${doc.filename}</title>
  <style>
    body { 
      font-family: system-ui, -apple-system, sans-serif; 
      max-width: 800px; 
      margin: 40px auto; 
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 { color: #d32f2f; margin-top: 0; }
    .info-row { 
      margin: 15px 0; 
      padding: 12px;
      background: #fafafa;
      border-left: 3px solid #d32f2f;
      border-radius: 4px;
    }
    .label { 
      font-weight: 600; 
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .value { 
      color: #333;
      font-size: 16px;
    }
    .status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status.approved { background: #4caf50; color: white; }
    .status.pending { background: #ff9800; color: white; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📄 ${doc.filename}</h1>
    <div class="info-row">
      <div class="label">Document Type</div>
      <div class="value">${this.formatDocType(doc.type)}</div>
    </div>
    <div class="info-row">
      <div class="label">Upload Date</div>
      <div class="value">${this.formatDate(doc.uploadDate)}</div>
    </div>
    <div class="info-row">
      <div class="label">File Size</div>
      <div class="value">${this.formatFileSize(doc.size)}</div>
    </div>
    <div class="info-row">
      <div class="label">Status</div>
      <div class="value">
        <span class="status ${doc.status}">${doc.status.toUpperCase()}</span>
      </div>
    </div>
    ${doc.loadId ? `
    <div class="info-row">
      <div class="label">Load ID</div>
      <div class="value">${doc.loadId}</div>
    </div>
    ` : ''}
    ${doc.notes ? `
    <div class="info-row">
      <div class="label">Notes</div>
      <div class="value">${doc.notes}</div>
    </div>
    ` : ''}
  </div>
</body>
</html>`;

    const blob = new Blob([content], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  }

  deleteDocument(doc: any) {
    if (confirm(`Are you sure you want to delete ${doc.filename}?`)) {
      this.documentService.deleteDocument(doc.id);
      this.loadDocuments();
      this.snackBar.open(`Deleted ${doc.filename}`, 'Close', { duration: 3000 });
    }
  }
}
