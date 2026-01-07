import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Note, CreateUpdateNoteRequest } from '../models/note.model';

@Injectable({
  providedIn: 'root'
})
export class NoteService {
  private readonly apiUrl = 'http://localhost:5000/api/notes';

  constructor(private http: HttpClient) {}

  createNote(request: CreateUpdateNoteRequest): Observable<Note> {
    return this.http.post<Note>(this.apiUrl, request).pipe(
      map(note => this.mapNoteDates(note))
    );
  }

  getNotes(entityType: string, entityId: string): Observable<Note[]> {
    return this.http.get<Note[]>(
      `${this.apiUrl}?entityType=${entityType}&entityId=${entityId}`
    ).pipe(
      map(notes => notes.map(n => this.mapNoteDates(n)))
    );
  }

  getPinnedNotes(entityType: string, entityId: string): Observable<Note[]> {
    return this.http.get<Note[]>(
      `${this.apiUrl}/pinned?entityType=${entityType}&entityId=${entityId}`
    ).pipe(
      map(notes => notes.map(n => this.mapNoteDates(n)))
    );
  }

  getNoteById(id: string): Observable<Note> {
    return this.http.get<Note>(`${this.apiUrl}/${id}`).pipe(
      map(note => this.mapNoteDates(note))
    );
  }

  updateNote(id: string, request: CreateUpdateNoteRequest): Observable<Note> {
    return this.http.put<Note>(`${this.apiUrl}/${id}`, request).pipe(
      map(note => this.mapNoteDates(note))
    );
  }

  deleteNote(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private mapNoteDates(note: any): Note {
    return {
      ...note,
      createdAt: new Date(note.createdAt),
      updatedAt: note.updatedAt ? new Date(note.updatedAt) : undefined
    };
  }
}
