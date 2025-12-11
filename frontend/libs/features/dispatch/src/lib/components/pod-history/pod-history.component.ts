import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProofOfDeliveryService, ProofOfDeliveryListDto } from '../services/proof-of-delivery.service';

@Component({
  selector: 'tms-pod-history',
  templateUrl: './pod-history.component.html',
  styleUrls: ['./pod-history.component.scss']
})
export class PODHistoryComponent implements OnInit {
  pods: ProofOfDeliveryListDto[] = [];
  filteredPods: ProofOfDeliveryListDto[] = [];
  isLoading = false;
  errorMessage = '';
  
  filterDriverId = '';
  filterStatus = -1;
  startDate: Date | null = null;
  endDate: Date | null = null;
  searchTerm = '';

  podStatus = {
    0: 'Draft',
    1: 'Pending',
    2: 'Signed',
    3: 'Completed',
    4: 'Rejected',
    5: 'Cancelled'
  };

  statusOptions = [
    { value: -1, label: 'All Statuses' },
    { value: 0, label: 'Draft' },
    { value: 1, label: 'Pending' },
    { value: 2, label: 'Signed' },
    { value: 3, label: 'Completed' },
    { value: 4, label: 'Rejected' },
    { value: 5, label: 'Cancelled' }
  ];

  constructor(
    private podService: ProofOfDeliveryService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAllPODs();
  }

  private loadAllPODs(): void {
    this.isLoading = true;
    this.podService.getPending().subscribe({
      next: (pods) => {
        this.pods = pods;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load PODs: ' + err.message;
        this.isLoading = false;
      }
    });
  }

  loadByDriver(): void {
    if (!this.filterDriverId.trim()) {
      this.errorMessage = 'Please enter a driver ID';
      return;
    }

    this.isLoading = true;
    this.podService.getByDriverId(
      this.filterDriverId,
      this.startDate || undefined,
      this.endDate || undefined
    ).subscribe({
      next: (pods) => {
        this.pods = pods;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load driver PODs: ' + err.message;
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.pods];

    // Filter by status
    if (this.filterStatus >= 0) {
      filtered = filtered.filter(p => p.status === this.filterStatus);
    }

    // Filter by search term (POD ID, Load ID, Trip ID)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.id.toLowerCase().includes(term) ||
        p.loadId.toLowerCase().includes(term) ||
        p.tripId.toLowerCase().includes(term)
      );
    }

    this.filteredPods = filtered;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.filterDriverId = '';
    this.filterStatus = -1;
    this.startDate = null;
    this.endDate = null;
    this.searchTerm = '';
    this.loadAllPODs();
  }

  viewPOD(pod: ProofOfDeliveryListDto): void {
    this.router.navigate(['/dispatch/pod', pod.id]);
  }

  editPOD(pod: ProofOfDeliveryListDto): void {
    this.router.navigate(['/dispatch/pod/capture', pod.id]);
  }

  getStatusBadgeClass(status: number): string {
    return `status-${status}`;
  }

  getStatusLabel(status: number): string {
    return this.podStatus[status as keyof typeof this.podStatus] || 'Unknown';
  }

  exportToCSV(): void {
    const headers = ['POD ID', 'Trip ID', 'Load ID', 'Driver ID', 'Status', 'Recipient', 'Delivery Date', 'On-Time'];
    const rows = this.filteredPods.map(p => [
      p.id,
      p.tripId,
      p.loadId,
      p.driverId,
      this.getStatusLabel(p.status),
      p.recipientName || 'N/A',
      p.deliveryDateTime ? new Date(p.deliveryDateTime).toLocaleString() : 'N/A',
      p.isOnTime ? 'Yes' : 'No'
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `POD-History-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
