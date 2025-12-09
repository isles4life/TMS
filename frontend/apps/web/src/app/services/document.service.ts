import { Injectable } from '@angular/core';

export interface Document {
  id: string;
  filename: string;
  size: number;
  type: 'proof-of-delivery' | 'bill-of-lading' | 'invoice' | 'manifest' | 'license' | 'inspection' | 'other';
  loadId?: string;
  notes?: string;
  uploadDate: Date;
  status: 'pending' | 'verified' | 'rejected';
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private documents: Document[] = [];

  constructor() {
    this.loadDocuments();
    this.generateMockDocuments();
  }

  private loadDocuments() {
    const stored = localStorage.getItem('documents');
    if (stored) {
      this.documents = JSON.parse(stored).map((d: any) => ({
        ...d,
        uploadDate: new Date(d.uploadDate)
      }));
    }
  }

  private saveDocuments() {
    localStorage.setItem('documents', JSON.stringify(this.documents));
  }

  private generateMockDocuments() {
    if (this.documents.length === 0) {
      const mockDocs: Document[] = [
        {
          id: this.generateId(),
          filename: 'POD_Load_12340.pdf',
          size: 1024 * 250,
          type: 'proof-of-delivery',
          loadId: '12340',
          notes: 'Delivery completed on 12/08/2025',
          uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
          status: 'verified'
        },
        {
          id: this.generateId(),
          filename: 'BOL_12338.pdf',
          size: 1024 * 180,
          type: 'bill-of-lading',
          loadId: '12338',
          notes: 'Original BOL for shipment',
          uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
          status: 'verified'
        },
        {
          id: this.generateId(),
          filename: 'Invoice_INV_001.pdf',
          size: 1024 * 100,
          type: 'invoice',
          notes: 'Invoice for load #12330',
          uploadDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
          status: 'verified'
        }
      ];

      this.documents = mockDocs;
      this.saveDocuments();
    }
  }

  getDocuments(): Document[] {
    return [...this.documents].sort((a, b) => 
      b.uploadDate.getTime() - a.uploadDate.getTime()
    );
  }

  addDocument(data: Omit<Document, 'id' | 'uploadDate'>): Document {
    const doc: Document = {
      ...data,
      id: this.generateId(),
      uploadDate: new Date()
    };
    this.documents.unshift(doc);
    this.saveDocuments();
    return doc;
  }

  updateDocument(id: string, updates: Partial<Document>) {
    const doc = this.documents.find(d => d.id === id);
    if (doc) {
      Object.assign(doc, updates);
      this.saveDocuments();
    }
  }

  deleteDocument(id: string) {
    this.documents = this.documents.filter(d => d.id !== id);
    this.saveDocuments();
  }

  getDocumentsByLoadId(loadId: string): Document[] {
    return this.documents.filter(d => d.loadId === loadId);
  }

  getDocumentsByStatus(status: 'pending' | 'verified' | 'rejected'): Document[] {
    return this.documents.filter(d => d.status === status);
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
