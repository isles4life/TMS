import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'tms-pod-status-badge',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pod-status-badge.component.html',
  styleUrls: ['./pod-status-badge.component.scss']
})
export class PODStatusBadgeComponent {
  @Input() podId: string | null = null;
  @Input() podStatus: number | null = null;
  @Input() driverId: string = '';
  @Input() loadId: string = '';
  @Output() viewPOD = new EventEmitter<string>();
  @Output() capturePOD = new EventEmitter<string>();

  podStatuses = {
    0: 'Draft',
    1: 'Pending',
    2: 'Signed',
    3: 'Completed',
    4: 'Rejected',
    5: 'Cancelled'
  };

  getStatusClass(status: number | null): string {
    if (status === null) return 'status-none';
    return `status-${status}`;
  }

  getStatusLabel(status: number | null): string {
    if (status === null) return 'No POD';
    return this.podStatuses[status as keyof typeof this.podStatuses] || 'Unknown';
  }

  onViewPOD(): void {
    if (this.podId) {
      this.viewPOD.emit(this.podId);
    }
  }

  onCapturePOD(): void {
    if (this.podId) {
      this.capturePOD.emit(this.podId);
    }
  }

  canEdit(): boolean {
    // Can only edit if in Draft or Pending status
    return this.podStatus === 0 || this.podStatus === 1;
  }

  canView(): boolean {
    return this.podId !== null;
  }
}
