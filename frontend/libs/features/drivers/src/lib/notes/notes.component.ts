import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { NoteService } from '../../../../../core/src/lib/services/note.service';
import { Note, NoteType, NotePriority } from '../../../../../core/src/lib/models/note.model';
import { NoteFormComponent } from './note-form/note-form.component';

@Component({
  selector: 'tms-notes',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
    MatTooltipModule,
    MatMenuModule,
    MatBadgeModule
  ],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>
          <div class="header-row">
            <div class="title-section">
              <mat-icon>notes</mat-icon>
              <span>Notes</span>
              <mat-chip [highlighted]="true">{{ notes().length }}</mat-chip>
              @if (pinnedNotes().length > 0) {
                <mat-chip [highlighted]="true" class="pinned-badge">
                  <mat-icon>push_pin</mat-icon>
                  {{ pinnedNotes().length }}
                </mat-chip>
              }
            </div>
            <div class="actions">
              <button mat-icon-button [matMenuTriggerFor]="filterMenu" matTooltip="Filter">
                <mat-icon>filter_list</mat-icon>
              </button>
              <button mat-raised-button color="primary" (click)="openNoteDialog()">
                <mat-icon>add</mat-icon>
                Add Note
              </button>
            </div>
          </div>
        </mat-card-title>
      </mat-card-header>
      
      <mat-card-content>
        @if (loading()) {
          <div class="loading-state">
            <mat-icon>sync</mat-icon>
            <p>Loading notes...</p>
          </div>
        } @else if (notes().length === 0) {
          <div class="empty-state">
            <mat-icon>note_add</mat-icon>
            <p>No notes yet</p>
            <button mat-stroked-button color="primary" (click)="openNoteDialog()">
              Add First Note
            </button>
          </div>
        } @else {
          <!-- Pinned Notes Section -->
          @if (pinnedNotes().length > 0) {
            <div class="pinned-section">
              <h3>
                <mat-icon>push_pin</mat-icon>
                Pinned Notes
              </h3>
              <div class="notes-list">
                @for (note of pinnedNotes(); track note.id) {
                  <div class="note-item pinned" [class.has-replies]="note.replyCount && note.replyCount > 0">
                    <div class="note-header">
                      <div class="note-meta">
                        <mat-chip [class]="'type-' + note.noteType">{{ getNoteTypeLabel(note.noteType) }}</mat-chip>
                        <mat-chip [class]="'priority-' + note.priority">{{ note.priority }}</mat-chip>
                        @if (note.replyCount && note.replyCount > 0) {
                          <mat-chip>
                            <mat-icon>comment</mat-icon>
                            {{ note.replyCount }}
                          </mat-chip>
                        }
                      </div>
                      <div class="note-actions">
                        <button mat-icon-button (click)="togglePin(note)" matTooltip="Unpin">
                          <mat-icon>push_pin</mat-icon>
                        </button>
                        <button mat-icon-button [matMenuTriggerFor]="noteMenu" (click)="selectNote(note)">
                          <mat-icon>more_vert</mat-icon>
                        </button>
                      </div>
                    </div>
                    
                    <div class="note-content">
                      <p>{{ note.content }}</p>
                    </div>
                    
                    <div class="note-footer">
                      <span class="author">{{ note.createdBy }}</span>
                      <span class="timestamp">{{ note.createdAt | date:'short' }}</span>
                      @if (note.updatedAt) {
                        <span class="edited">(edited)</span>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- Regular Notes Section -->
          <div class="notes-section">
            @if (pinnedNotes().length > 0) {
              <h3>All Notes</h3>
            }
            <div class="notes-list">
              @for (note of filteredNotes(); track note.id) {
                <div class="note-item" [class.has-replies]="note.replyCount && note.replyCount > 0">
                  <div class="note-header">
                    <div class="note-meta">
                      <mat-chip [class]="'type-' + note.noteType">{{ getNoteTypeLabel(note.noteType) }}</mat-chip>
                      <mat-chip [class]="'priority-' + note.priority">{{ note.priority }}</mat-chip>
                      @if (note.replyCount && note.replyCount > 0) {
                        <mat-chip>
                          <mat-icon>comment</mat-icon>
                          {{ note.replyCount }}
                        </mat-chip>
                      }
                    </div>
                    <div class="note-actions">
                      <button mat-icon-button (click)="togglePin(note)" matTooltip="Pin">
                        <mat-icon>push_pin</mat-icon>
                      </button>
                      <button mat-icon-button [matMenuTriggerFor]="noteMenu" (click)="selectNote(note)">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                    </div>
                  </div>
                  
                  <div class="note-content">
                    <p>{{ note.content }}</p>
                  </div>
                  
                  <div class="note-footer">
                    <span class="author">{{ note.createdBy }}</span>
                    <span class="timestamp">{{ note.createdAt | date:'short' }}</span>
                    @if (note.updatedAt) {
                      <span class="edited">(edited)</span>
                    }
                  </div>
                  
                  @if (note.replyCount && note.replyCount > 0) {
                    <div class="note-replies">
                      <button mat-button (click)="loadReplies(note)">
                        <mat-icon>comment</mat-icon>
                        View {{ note.replyCount }} {{ note.replyCount === 1 ? 'Reply' : 'Replies' }}
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }
      </mat-card-content>
    </mat-card>

    <mat-menu #filterMenu="matMenu">
      <button mat-menu-item (click)="filterByType(null)">
        <mat-icon>clear</mat-icon>
        All Types
      </button>
      <button mat-menu-item (click)="filterByType('General')">General</button>
      <button mat-menu-item (click)="filterByType('Dispatch')">Dispatch</button>
      <button mat-menu-item (click)="filterByType('Accounting')">Accounting</button>
      <button mat-menu-item (click)="filterByType('CustomerService')">Customer Service</button>
      <button mat-menu-item (click)="filterByType('Safety')">Safety</button>
      <button mat-menu-item (click)="filterByType('Maintenance')">Maintenance</button>
      <button mat-menu-item (click)="filterByType('Compliance')">Compliance</button>
      <button mat-menu-item (click)="filterByType('Claims')">Claims</button>
      <button mat-menu-item (click)="filterByType('Internal')">Internal</button>
    </mat-menu>

    <mat-menu #noteMenu="matMenu">
      <button mat-menu-item (click)="replyToNote()">
        <mat-icon>reply</mat-icon>
        Reply
      </button>
      <button mat-menu-item (click)="editNote()">
        <mat-icon>edit</mat-icon>
        Edit
      </button>
      <button mat-menu-item (click)="deleteNote()">
        <mat-icon>delete</mat-icon>
        Delete
      </button>
    </mat-menu>
  `,
  styles: [`
    :host {
      display: block;
    }

    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 1rem 0;
    }

    .title-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      
      mat-icon {
        color: var(--primary-color);
      }
      
      span {
        font-size: 1.25rem;
        font-weight: 500;
      }
    }

    .pinned-badge {
      background-color: var(--warning-color) !important;
      color: white !important;
      
      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
      }
    }

    .actions {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .loading-state, .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      gap: 1rem;
      
      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--muted-color);
      }
      
      p {
        color: var(--text-secondary);
        margin: 0;
      }
    }

    .pinned-section, .notes-section {
      margin-bottom: 2rem;
      
      h3 {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin: 0 0 1rem 0;
        color: var(--text-secondary);
        font-size: 0.9rem;
        font-weight: 500;
        text-transform: uppercase;
        
        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }

    .notes-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .note-item {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem;
      background: var(--surface-color);
      transition: all 0.2s;
      
      &:hover {
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      &.pinned {
        border-color: var(--warning-color);
        border-width: 2px;
        background: var(--warning-bg);
      }
      
      &.has-replies {
        border-left: 3px solid var(--primary-color);
      }
    }

    .note-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }

    .note-meta {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      align-items: center;
    }

    mat-chip {
      font-size: 0.75rem;
      height: 24px;
      
      &.type-General { background-color: #6c757d; color: white; }
      &.type-Dispatch { background-color: #007bff; color: white; }
      &.type-Accounting { background-color: #28a745; color: white; }
      &.type-CustomerService { background-color: #17a2b8; color: white; }
      &.type-Safety { background-color: #ffc107; color: black; }
      &.type-Maintenance { background-color: #fd7e14; color: white; }
      &.type-Compliance { background-color: #6610f2; color: white; }
      &.type-Claims { background-color: #dc3545; color: white; }
      &.type-Internal { background-color: #6f42c1; color: white; }
      
      &.priority-Low { background-color: #e0e0e0; color: #333; }
      &.priority-Normal { background-color: #2196F3; color: white; }
      &.priority-High { background-color: #ff9800; color: white; }
      &.priority-Critical { background-color: #f44336; color: white; }
      
      mat-icon {
        font-size: 14px;
        width: 14px;
        height: 14px;
        margin-right: 4px;
      }
    }

    .note-actions {
      display: flex;
      gap: 0.25rem;
    }

    .note-content {
      margin: 1rem 0;
      
      p {
        margin: 0;
        line-height: 1.6;
        white-space: pre-wrap;
      }
    }

    .note-footer {
      display: flex;
      gap: 1rem;
      align-items: center;
      font-size: 0.85rem;
      color: var(--text-secondary);
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-color);
      
      .author {
        font-weight: 500;
        color: var(--text-primary);
      }
      
      .edited {
        font-style: italic;
        color: var(--muted-color);
      }
    }

    .note-replies {
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-color);
    }
  `]
})
export class NotesComponent implements OnInit {
  @Input({ required: true }) entityType!: string;
  @Input({ required: true }) entityId!: string;

  notes = signal<Note[]>([]);
  pinnedNotes = signal<Note[]>([]);
  filteredNotes = signal<Note[]>([]);
  loading = signal(false);
  selectedNote: Note | null = null;
  currentTypeFilter: NoteType | null = null;

  constructor(
    private noteService: NoteService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadNotes();
  }

  loadNotes() {
    this.loading.set(true);

    this.noteService.getNotes(this.entityType, this.entityId).subscribe({
      next: (notes: Note[]) => {
        const pinned = notes.filter((n: Note) => n.isPinned);
        const unpinned = notes.filter((n: Note) => !n.isPinned);

        this.notes.set(notes);
        this.pinnedNotes.set(pinned);
        this.filteredNotes.set(unpinned);
        this.loading.set(false);
      },
      error: (error: any) => {
        console.warn('Notes unavailable for this entity:', error.message || error);
        this.notes.set([]);
        this.pinnedNotes.set([]);
        this.filteredNotes.set([]);
        this.loading.set(false);
      }
    });
  }

  openNoteDialog(parentNote?: Note) {
    const dialogRef = this.dialog.open(NoteFormComponent, {
      width: '600px',
      data: {
        entityType: this.entityType,
        entityId: this.entityId,
        parentNoteId: parentNote?.id
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadNotes();
      }
    });
  }

  selectNote(note: Note) {
    this.selectedNote = note;
  }

  editNote() {
    if (this.selectedNote) {
      const dialogRef = this.dialog.open(NoteFormComponent, {
        width: '600px',
        data: {
          entityType: this.entityType,
          entityId: this.entityId,
          note: this.selectedNote
        }
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.loadNotes();
        }
      });
    }
  }

  replyToNote() {
    if (this.selectedNote) {
      this.openNoteDialog(this.selectedNote);
    }
  }

  deleteNote() {
    if (this.selectedNote && confirm('Are you sure you want to delete this note?')) {
      this.noteService.deleteNote(this.selectedNote.id).subscribe({
        next: () => {
          this.loadNotes();
        },
          error: (error: any) => {
          console.error('Error deleting note:', error);
        }
      });
    }
  }

  togglePin(note: Note) {
    const updated = { ...note, isPinned: !note.isPinned };
    this.noteService.updateNote(note.id, {
      entityType: note.entityType,
      entityId: note.entityId,
      noteType: note.noteType,
      priority: note.priority,
      content: note.content,
      isPinned: updated.isPinned
    }).subscribe({
      next: () => {
        this.loadNotes();
      },
        error: (error: any) => {
        console.error('Error updating note:', error);
      }
    });
  }

  filterByType(type: string | null) {
    this.currentTypeFilter = type as NoteType | null;
    if (type === null) {
      this.filteredNotes.set(this.notes().filter(n => !n.isPinned));
    } else {
      this.filteredNotes.set(
        this.notes().filter(n => !n.isPinned && n.noteType === type)
      );
    }
  }

  loadReplies(note: Note) {
    // This would typically navigate to a detail view or expand inline
    console.log('Load replies for note:', note.id);
  }

  getNoteTypeLabel(type: NoteType): string {
    return type.replace(/([A-Z])/g, ' $1').trim();
  }
}
