# Documents Module

## Overview

The Documents Module is a comprehensive document management system integrated into the TMS (Transportation Management System) frontend application. It enables users to upload, manage, and track documents related to loads, drivers, and business operations.

## Features

### 📤 Document Upload
- **Drag-and-drop interface** - Users can drag files directly onto the upload zone
- **Multiple file selection** - Upload one or more files at once
- **File validation** - Supports common document formats (PDF, DOCX, XLSX, JPG, PNG, ZIP, etc.)
- **Document classification** - Categorize documents by type (Proof of Delivery, Bill of Lading, Invoice, etc.)
- **Load association** - Link documents to specific loads for easy tracking
- **Custom notes** - Add notes or context to each upload

### 📋 Document Management
- **Document listing** - View all uploaded documents with metadata
- **Status tracking** - Documents can be in pending, verified, or rejected status
- **File information** - See document name, size, and upload date
- **Quick actions** - Download, preview, or delete documents
- **Sorting** - Documents sorted by most recent upload first

### 🔔 Notification Integration
- **Upload confirmation** - Automatic notifications when documents are uploaded
- **Pending uploads tab** - View all pending document upload requests
- **Quick actions from notifications** - Upload documents directly from notification prompts
- **Status updates** - Get notified when documents are verified or rejected

## Architecture

### File Structure

```
frontend/apps/web/src/
├── app/
│   ├── pages/
│   │   └── documents/
│   │       └── documents.page.ts          # Main documents component
│   └── services/
│       └── document.service.ts            # Document data management
├── app.routes.ts                          # Route configuration
└── app.component.ts                       # Sidebar navigation
```

### Components

#### DocumentsPage (`documents.page.ts`)
The main page component that handles:
- File upload interface (drag-and-drop and file selection)
- Document form (type, load ID, notes)
- Document listing with actions
- Pending notifications display
- Integration with DocumentService and NotificationService

**Key Methods:**
- `uploadDocument()` - Processes and stores uploaded files
- `onDrop()` / `onDragOver()` - Handles drag-and-drop events
- `loadDocuments()` - Fetches documents from service
- `formatFileSize()` - Converts bytes to human-readable format
- `getDocumentIcon()` - Returns appropriate icon for document type

#### DocumentService (`document.service.ts`)
Service for document data management:
- Local storage persistence
- CRUD operations (Create, Read, Update, Delete)
- Mock data generation for demo
- Query methods (by status, by load ID)

**Key Methods:**
- `addDocument()` - Create new document record
- `getDocuments()` - Retrieve all documents
- `updateDocument()` - Update document status or metadata
- `deleteDocument()` - Remove document
- `getDocumentsByLoadId()` - Filter documents by associated load
- `getDocumentsByStatus()` - Filter documents by status

## Document Types

Supported document classifications:

| Type | Use Case | Icon |
|------|----------|------|
| `proof-of-delivery` | Proof of delivery confirmation | check_circle |
| `bill-of-lading` | Bill of lading document | receipt |
| `invoice` | Invoice or payment document | receipt_long |
| `manifest` | Shipment manifest | assignment |
| `license` | License or permit | badge |
| `inspection` | Inspection report | assessment |
| `other` | Other document types | description |

## Document States

Documents progress through the following states:

- **pending** - Document uploaded, awaiting verification
- **verified** - Document verified and approved
- **rejected** - Document rejected, may need resubmission

## Usage Guide

### Uploading Documents

1. **Navigate to Documents Page**
   - Click "Documents" in the sidebar navigation
   - Or go to `/documents` route

2. **Upload Tab**
   - Drag files into the upload zone, or click "Select Files"
   - Choose document type from dropdown
   - (Optional) Enter related Load ID
   - (Optional) Add notes
   - Click "Upload [n] File(s)" button

3. **Confirmation**
   - Success notification appears
   - Document appears in "Uploaded Documents" tab

### Viewing Documents

1. **Uploaded Documents Tab**
   - See all uploaded documents
   - View status (pending/verified/rejected)
   - Download, preview, or delete
   - See related load information

2. **Pending Uploads Tab**
   - View outstanding document upload requests
   - Navigate to upload form from notification
   - Mark as done when completed

### Managing Documents

- **Download** - Download document file
- **Preview** - View document (if format supported)
- **Delete** - Remove document from system
- **Update Status** - Administrator can verify or reject documents

## Integration Points

### Notification System
Documents module integrates with the NotificationService:

```typescript
// When document uploaded
this.notificationService.addNotification({
  title: 'Document Uploaded',
  message: 'filename has been uploaded and is pending verification.',
  type: 'success',
  category: 'Documents',
  link: '/documents'
});

// Pending uploads appear in notifications
// "Document Upload Required" notifications link to documents page
```

### Routes
- **Route**: `/documents`
- **Protected**: Yes (requires authentication via AuthGuard)
- **Title**: "Documents"

### Sidebar Navigation
- **Label**: "Documents"
- **Icon**: "description"
- **Position**: After Load Board, before Marketplace

## Data Storage

Documents are persisted using browser localStorage under the key `documents`.

### Document Object Structure
```typescript
interface Document {
  id: string;                    // Unique identifier
  filename: string;              // Original filename
  size: number;                  // File size in bytes
  type: 'proof-of-delivery' | 'bill-of-lading' | 'invoice' | 'manifest' | 'license' | 'inspection' | 'other';
  loadId?: string;               // Associated load ID (optional)
  notes?: string;                // Custom notes (optional)
  uploadDate: Date;              // Upload timestamp
  status: 'pending' | 'verified' | 'rejected';  // Current status
}
```

### Mock Data
Demo data includes 3 sample documents:
- POD_Load_12340.pdf (verified)
- BOL_12338.pdf (verified)
- Invoice_INV_001.pdf (verified)

## UI Components Used

- **MatCardModule** - Document cards and containers
- **MatButtonModule** - Action buttons
- **MatIconModule** - Material icons
- **MatProgressBarModule** - Upload progress (future)
- **MatChipsModule** - Status badges
- **MatTabsModule** - Tab navigation (Upload/Documents/Pending)
- **MatFormFieldModule** - Form inputs
- **MatSelectModule** - Dropdown selectors
- **MatSnackBarModule** - Toast notifications
- **ReactiveFormsModule** - Form management

## Styling

The module uses CSS Grid and Flexbox for responsive layout:
- Responsive design works on desktop and mobile
- Drag-and-drop zone has visual feedback on hover/drag
- Status chips are color-coded:
  - Pending: Orange
  - Verified: Green
  - Rejected: Red

## Future Enhancements

Potential improvements for future versions:

1. **Real File Upload**
   - Integrate with backend API for actual file storage
   - Support for cloud storage (S3, Azure Blob)
   - Virus/malware scanning

2. **Advanced Features**
   - File preview capability (PDF, images)
   - OCR text extraction
   - Document search and filters
   - Bulk operations

3. **Performance**
   - Pagination for large document lists
   - Lazy loading for document previews
   - File compression on upload

4. **Security**
   - Document encryption
   - Access control per document
   - Audit logging

5. **Automation**
   - Automatic document verification
   - Email notifications on status changes
   - Document expiration tracking

## Dependencies

- **Angular 17.x** - Core framework
- **Angular Material 17.x** - UI components
- **RxJS** - Reactive programming
- **TypeScript** - Language

## Related Modules

- **NotificationService** - Document upload notifications
- **AuthService** - User authentication
- **LoadService** - Load data association
- **ProfilePage** - User document management

## Testing

### Manual Testing Checklist

- [ ] Upload single file
- [ ] Upload multiple files
- [ ] Drag-and-drop file upload
- [ ] Cancel file upload
- [ ] View uploaded documents
- [ ] Delete document
- [ ] View pending notifications
- [ ] Click notification to upload document
- [ ] Form validation (document type required)
- [ ] File size formatting

### Test Data

Pre-loaded mock documents for testing:
- Various document types
- Different file sizes
- Multiple status states
- Linked to different loads

## Troubleshooting

### Upload Not Working
- Check file size limits (max 50MB recommended)
- Verify file format is supported
- Check browser localStorage is enabled
- Clear browser cache if needed

### Documents Not Showing
- Verify localStorage data hasn't been cleared
- Check browser console for errors
- Reload page to refresh document list

### Notifications Not Appearing
- Verify NotificationService is properly injected
- Check that notification was created after upload
- View Notifications page to confirm notification exists

## API Endpoints (Future)

When connected to backend API:

```
POST   /api/documents              - Upload document
GET    /api/documents              - List documents
GET    /api/documents/:id          - Get document details
DELETE /api/documents/:id          - Delete document
PUT    /api/documents/:id/status   - Update document status
GET    /api/documents/load/:loadId - Get documents by load
```

## Environment Configuration

No special environment configuration required. Documents use:
- Browser localStorage for persistence
- Material Design theming
- Angular Material icon library

## Support

For issues or feature requests related to the Documents Module:
1. Check this README
2. Review code comments in `documents.page.ts` and `document.service.ts`
3. Check browser console for error messages
4. Review notification system integration

## Version History

**v1.0.0** (December 9, 2025)
- Initial release
- Core upload functionality
- Document management
- Notification integration
- Mock data support
