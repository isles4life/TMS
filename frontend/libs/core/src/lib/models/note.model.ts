export interface Note {
  id: string;
  entityType: string;
  entityId: string;
  content: string;
  noteType: NoteType;
  priority: NotePriority;
  isPinned: boolean;
  isVisibleToCustomer: boolean;
  userId?: string;
  userName?: string;
  createdBy?: string;
  replyCount?: number;
  parentNoteId?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateUpdateNoteRequest {
  entityType: string;
  entityId: string;
  content: string;
  noteType?: NoteType;
  priority?: NotePriority;
  isPinned?: boolean;
  isVisibleToCustomer?: boolean;
  parentNoteId?: string;
}

export enum NoteType {
  General = 'General',
  Dispatch = 'Dispatch',
  Accounting = 'Accounting',
  CustomerService = 'CustomerService',
  Safety = 'Safety',
  Maintenance = 'Maintenance',
  Compliance = 'Compliance',
  Claims = 'Claims',
  Internal = 'Internal'
}

export enum NotePriority {
  Low = 'Low',
  Normal = 'Normal',
  High = 'High',
  Critical = 'Critical'
}
