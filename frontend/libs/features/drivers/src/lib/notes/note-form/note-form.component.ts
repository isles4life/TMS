import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NoteService } from '../../../../../../core/src/lib/services/note.service';
import { Note, NoteType, NotePriority, CreateUpdateNoteRequest } from '../../../../../../core/src/lib/models/note.model';

@Component({
  selector: 'tms-note-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatCheckboxModule
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>{{ isEditing ? 'edit' : 'note_add' }}</mat-icon>
      {{ isEditing ? 'Edit Note' : (isReply ? 'Reply to Note' : 'Add Note') }}
    </h2>
    
    <mat-dialog-content>
      <form [formGroup]="form" class="note-form">
        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Note Type</mat-label>
            <mat-select formControlName="noteType">
              <mat-option value="General">General</mat-option>
              <mat-option value="Dispatch">Dispatch</mat-option>
              <mat-option value="Accounting">Accounting</mat-option>
              <mat-option value="CustomerService">Customer Service</mat-option>
              <mat-option value="Safety">Safety</mat-option>
              <mat-option value="Maintenance">Maintenance</mat-option>
              <mat-option value="Compliance">Compliance</mat-option>
              <mat-option value="Claims">Claims</mat-option>
              <mat-option value="Internal">Internal</mat-option>
            </mat-select>
            <mat-icon matPrefix>category</mat-icon>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Priority</mat-label>
            <mat-select formControlName="priority">
              <mat-option value="Low">
                <mat-icon class="priority-icon low">arrow_downward</mat-icon>
                Low
              </mat-option>
              <mat-option value="Normal">
                <mat-icon class="priority-icon normal">remove</mat-icon>
                Normal
              </mat-option>
              <mat-option value="High">
                <mat-icon class="priority-icon high">arrow_upward</mat-icon>
                High
              </mat-option>
              <mat-option value="Critical">
                <mat-icon class="priority-icon critical">priority_high</mat-icon>
                Critical
              </mat-option>
            </mat-select>
            <mat-icon matPrefix>flag</mat-icon>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Note Content</mat-label>
            <textarea matInput formControlName="content" rows="8" 
                      placeholder="Enter your note here..."></textarea>
            <mat-icon matPrefix>edit</mat-icon>
            <mat-hint>{{ form.get('content')?.value?.length || 0 }} characters</mat-hint>
          </mat-form-field>
        </div>

        <div class="form-row">
          <mat-checkbox formControlName="isPinned">
            <mat-icon>push_pin</mat-icon>
            Pin this note
          </mat-checkbox>
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="!form.valid || submitting()"
              (click)="submit()">
        @if (submitting()) {
          <ng-container>
            <mat-icon>sync</mat-icon>
            Saving...
          </ng-container>
        } @else {
          <ng-container>
            <mat-icon>save</mat-icon>
            {{ isEditing ? 'Update' : 'Save' }} Note
          </ng-container>
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      mat-icon {
        color: var(--primary-color);
      }
    }

    .note-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem 0;
      min-width: 500px;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    mat-icon[matPrefix] {
      margin-right: 0.5rem;
      color: var(--text-secondary);
    }

    .priority-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 0.5rem;
      vertical-align: middle;
      
      &.low { color: #9e9e9e; }
      &.normal { color: #2196F3; }
      &.high { color: #ff9800; }
      &.critical { color: #f44336; }
    }

    mat-checkbox {
      display: flex;
      align-items: center;
      
      mat-icon {
        margin-right: 0.5rem;
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    mat-dialog-actions {
      padding: 1rem;
      gap: 0.5rem;
    }
  `]
})
export class NoteFormComponent implements OnInit {
  form: FormGroup;
  submitting = signal(false);
  isEditing = false;
  isReply = false;

  constructor(
    private fb: FormBuilder,
    private noteService: NoteService,
    private dialogRef: MatDialogRef<NoteFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      entityType: string;
      entityId: string;
      parentNoteId?: string;
      note?: Note;
    }
  ) {
    this.isEditing = !!data.note;
    this.isReply = !!data.parentNoteId;

    this.form = this.fb.group({
      noteType: [data.note?.noteType || 'General', Validators.required],
      priority: [data.note?.priority || 'Normal', Validators.required],
      content: [data.note?.content || '', [Validators.required, Validators.minLength(1)]],
      isPinned: [data.note?.isPinned || false]
    });
  }

  ngOnInit() {}

  submit() {
    if (this.form.valid) {
      this.submitting.set(true);
      
      const request: CreateUpdateNoteRequest = {
        entityType: this.data.entityType,
        entityId: this.data.entityId,
        noteType: this.form.value.noteType,
        priority: this.form.value.priority,
        content: this.form.value.content,
        isPinned: this.form.value.isPinned,
        parentNoteId: this.data.parentNoteId
      };
      
      const operation = this.isEditing
        ? this.noteService.updateNote(this.data.note!.id, request)
        : this.noteService.createNote(request);

      operation.subscribe({
        next: () => {
          this.submitting.set(false);
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          console.error('Error saving note:', error);
          this.submitting.set(false);
        }
      });
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }
}
