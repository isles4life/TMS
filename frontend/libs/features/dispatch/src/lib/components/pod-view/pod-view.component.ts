import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProofOfDeliveryService, ProofOfDeliveryDto, ProofOfDeliveryListDto } from '../services/proof-of-delivery.service';

@Component({
  selector: 'tms-pod-view',
  templateUrl: './pod-view.component.html',
  styleUrls: ['./pod-view.component.scss']
})
export class PODViewComponent implements OnInit {
  pod: ProofOfDeliveryDto | null = null;
  isLoading = false;
  errorMessage = '';

  podStatus = {
    0: 'Draft',
    1: 'Pending',
    2: 'Signed',
    3: 'Completed',
    4: 'Rejected',
    5: 'Cancelled'
  };

  photoTypes = [
    { value: 0, label: 'Load Condition' },
    { value: 1, label: 'Signed Documents' },
    { value: 2, label: 'Delivery Proof' },
    { value: 3, label: 'Damage Report' },
    { value: 4, label: 'Safety Compliance' },
    { value: 5, label: 'Other' }
  ];

  constructor(
    private route: ActivatedRoute,
    private podService: ProofOfDeliveryService
  ) { }

  ngOnInit(): void {
    const podId = this.route.snapshot.paramMap.get('id');
    if (podId) {
      this.loadPOD(podId);
    }
  }

  private loadPOD(id: string): void {
    this.isLoading = true;
    this.podService.getProofOfDelivery(id).subscribe({
      next: (pod) => {
        this.pod = pod;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load POD: ' + err.message;
        this.isLoading = false;
      }
    });
  }

  getStatusLabel(status: number): string {
    return this.podStatus[status as keyof typeof this.podStatus] || 'Unknown';
  }

  getPhotoTypeLabel(type: number): string {
    return this.photoTypes.find(t => t.value === type)?.label || 'Unknown';
  }

  getStatusBadgeClass(status: number): string {
    return `status-${status}`;
  }

  downloadPOD(): void {
    if (!this.pod) return;
    
    // Generate PDF from POD data
    const content = this.generatePODContent();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `POD-${this.pod.id}.txt`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private generatePODContent(): string {
    if (!this.pod) return '';

    let content = `PROOF OF DELIVERY\n`;
    content += `================\n\n`;
    content += `POD ID: ${this.pod.id}\n`;
    content += `Trip ID: ${this.pod.tripId}\n`;
    content += `Load ID: ${this.pod.loadId}\n`;
    content += `Driver ID: ${this.pod.driverId}\n\n`;
    
    content += `Status: ${this.getStatusLabel(this.pod.status)}\n`;
    content += `Created: ${new Date(this.pod.createdAt).toLocaleString()}\n`;
    content += `Recipient: ${this.pod.recipientName}\n`;
    content += `Delivery DateTime: ${this.pod.deliveryDateTime ? new Date(this.pod.deliveryDateTime).toLocaleString() : 'N/A'}\n`;
    content += `On-Time: ${this.pod.isOnTime !== null ? (this.pod.isOnTime ? 'Yes' : 'No') : 'N/A'}\n\n`;
    
    if (this.pod.deliveryNotes) {
      content += `Notes: ${this.pod.deliveryNotes}\n\n`;
    }

    if (this.pod.photos && this.pod.photos.length > 0) {
      content += `Photos: ${this.pod.photos.length}\n`;
      this.pod.photos.forEach((photo, index) => {
        content += `  ${index + 1}. ${this.getPhotoTypeLabel(photo.photoType)}\n`;
        if (photo.description) {
          content += `     Description: ${photo.description}\n`;
        }
      });
    }

    return content;
  }
}
