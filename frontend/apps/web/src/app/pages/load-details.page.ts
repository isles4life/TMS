import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../components/page-header.component';
import { ActivatedRoute } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

interface LoadDetail {
  id: string;
  origin: string;
  destination: string;
  equipment: string;
  rate: string;
  pickup: string;
  status: 'Available' | 'Booked' | 'Pending';
  notes: string;
  tags: string[];
};

const MOCK_LOAD_DETAILS: Record<string, LoadDetail> = {
  'LB-4821': { id: 'LB-4821', origin: 'Boise, ID', destination: 'Portland, OR', equipment: 'Van', rate: '$2.45 / mile', pickup: 'Today 2:00p', status: 'Available', notes: 'No tarps required. Call 30 minutes before arrival. Facility requires safety vest.', tags: ['Live load', 'Appointment', 'No tarp'] },
  'LB-4822': { id: 'LB-4822', origin: 'Dallas, TX', destination: 'Denver, CO', equipment: 'Reefer', rate: '$2.92 / mile', pickup: 'Today 5:00p', status: 'Pending', notes: 'Pre-cool to 36F. Lumper included. Temperature monitoring required.', tags: ['Reefer', 'Lumper included', 'Temp monitor'] },
  'LB-4823': { id: 'LB-4823', origin: 'Atlanta, GA', destination: 'Chicago, IL', equipment: 'Flatbed', rate: '$2.15 / mile', pickup: 'Tomorrow 9:00a', status: 'Booked', notes: 'Straps and edge protectors needed. FCFS until 8p.', tags: ['FCFS', 'Straps', 'Booked'] },
  'LB-6010': { id: 'LB-6010', origin: 'Boise, ID', destination: 'Salt Lake City, UT', equipment: 'Van', rate: '$2.35 / mile', pickup: 'Today 1:00p', status: 'Available', notes: 'No tarps required. Call 30 minutes before arrival. Facility requires safety vest.', tags: ['Live load', 'Appointment', 'No tarp'] },
  'LB-6011': { id: 'LB-6011', origin: 'Seattle, WA', destination: 'Spokane, WA', equipment: 'Flatbed', rate: '$2.18 / mile', pickup: 'Today 4:30p', status: 'Pending', notes: 'Straps and edge protectors needed. FCFS until 8p.', tags: ['FCFS', 'Straps'] },
  'LB-6012': { id: 'LB-6012', origin: 'Dallas, TX', destination: 'Phoenix, AZ', equipment: 'Reefer', rate: '$2.90 / mile', pickup: 'Tomorrow 8:00a', status: 'Available', notes: 'Pre-cool to 36F. Lumper included.', tags: ['Reefer', 'Lumper included'] },
  'LB-6013': { id: 'LB-6013', origin: 'Chicago, IL', destination: 'Columbus, OH', equipment: 'Van', rate: '$2.25 / mile', pickup: 'Tomorrow 9:15a', status: 'Available', notes: 'Drop and hook. 24/7 gate access.', tags: ['Drop & hook'] },
  'LB-6014': { id: 'LB-6014', origin: 'Atlanta, GA', destination: 'Tampa, FL', equipment: 'Reefer', rate: '$2.78 / mile', pickup: 'Today 6:45p', status: 'Pending', notes: 'Live unload, appointment required. Call consignee for dock.', tags: ['Appointment', 'Live unload'] },
  'LB-6015': { id: 'LB-6015', origin: 'Denver, CO', destination: 'Kansas City, MO', equipment: 'Flatbed', rate: '$2.05 / mile', pickup: 'Tomorrow 7:30a', status: 'Available', notes: 'Tarp optional; pipe stakes needed.', tags: ['Flatbed', 'Pipe stakes'] },
  'LB-6016': { id: 'LB-6016', origin: 'Los Angeles, CA', destination: 'Sacramento, CA', equipment: 'Van', rate: '$2.60 / mile', pickup: 'Today 3:20p', status: 'Available', notes: 'No pallet exchange. Delivery before noon.', tags: ['No pallet exchange'] },
  'LB-6017': { id: 'LB-6017', origin: 'Houston, TX', destination: 'New Orleans, LA', equipment: 'Reefer', rate: '$2.48 / mile', pickup: 'Today 5:00p', status: 'Pending', notes: 'Temp 34F. Lumpers reimbursed with receipt.', tags: ['Reefer', 'Reimburse lumpers'] },
  'LB-6018': { id: 'LB-6018', origin: 'Minneapolis, MN', destination: 'Milwaukee, WI', equipment: 'Flatbed', rate: '$2.15 / mile', pickup: 'Tomorrow 10:10a', status: 'Available', notes: 'Side kits acceptable. FCFS 7a-3p.', tags: ['Flatbed', 'FCFS'] },
  'LB-6019': { id: 'LB-6019', origin: 'Phoenix, AZ', destination: 'Las Vegas, NV', equipment: 'Van', rate: '$2.30 / mile', pickup: 'Today 8:00p', status: 'Available', notes: 'Night pickup; driver must call gate.', tags: ['Night pickup'] },
  'LB-6020': { id: 'LB-6020', origin: 'Portland, OR', destination: 'Redding, CA', equipment: 'Reefer', rate: '$2.65 / mile', pickup: 'Tomorrow 6:45a', status: 'Available', notes: 'Produce load; pulp at 35F.', tags: ['Produce', 'Reefer'] },
  'LB-6021': { id: 'LB-6021', origin: 'Charlotte, NC', destination: 'Nashville, TN', equipment: 'Van', rate: '$2.12 / mile', pickup: 'Tomorrow 11:30a', status: 'Pending', notes: 'Driver assist not required.', tags: ['Van'] },
  'LB-6022': { id: 'LB-6022', origin: 'Cincinnati, OH', destination: 'Detroit, MI', equipment: 'Flatbed', rate: '$2.08 / mile', pickup: 'Today 2:50p', status: 'Available', notes: 'Steel coils; chains and binders required.', tags: ['Steel', 'Chains'] },
};

@Component({
  selector: 'app-load-details-page',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatSnackBarModule,
    PageHeaderComponent
  ],
  template: `
    <div class="page">
      <app-ts-page-header 
        eyebrow="Load detail" 
        [title]="load?.id ?? 'Loading...'"
        [description]="load?.origin + ' to ' + load?.destination"
        [hasActions]="true">
        <button mat-stroked-button color="primary" (click)="shareLoad()">
          <mat-icon>share</mat-icon>
          Share
        </button>
      </app-ts-page-header>

      
      <div class="detail-grid">
        <mat-card class="panel">
          <div class="panel__header">
            <div>
              <p class="eyebrow">Route</p>
                <h3>{{ load?.origin }} → {{ load?.destination }}</h3>
            </div>
            <mat-chip color="primary" selected>{{ load?.status }}</mat-chip>
          </div>
          <div class="detail-list">
            <div class="detail-item">
              <mat-icon color="primary">schedule</mat-icon>
              <div class="detail-content">
                <div class="detail-label">Pickup</div>
                  <div class="detail-value">{{ load?.pickup }}</div>
              </div>
            </div>
            <div class="detail-item">
              <mat-icon color="primary">local_shipping</mat-icon>
              <div class="detail-content">
                <div class="detail-label">Equipment</div>
                  <div class="detail-value">{{ load?.equipment }}</div>
              </div>
            </div>
            <div class="detail-item">
              <mat-icon color="primary">paid</mat-icon>
              <div class="detail-content">
                <div class="detail-label">Rate</div>
                  <div class="detail-value">{{ load?.rate }}</div>
              </div>
            </div>
            <div class="detail-item">
              <mat-icon color="primary">confirmation_number</mat-icon>
              <div class="detail-content">
                <div class="detail-label">Load ID</div>
                <div class="detail-value">{{ load?.id }}</div>
              </div>
            </div>
          </div>
        </mat-card>

        <mat-card class="panel">
          <div class="panel__header">
            <div>
              <p class="eyebrow">Carrier</p>
              <h3>Carrier Insight</h3>
            </div>
          </div>
          <div class="detail-list">
            <div class="detail-item">
              <mat-icon color="primary">verified_user</mat-icon>
              <div class="detail-content">
                <div class="detail-label">Risk</div>
                <div class="detail-value">Low</div>
              </div>
            </div>
            <div class="detail-item">
              <mat-icon color="primary">star</mat-icon>
              <div class="detail-content">
                <div class="detail-label">Rating</div>
                <div class="detail-value">4.7</div>
              </div>
            </div>
            <div class="detail-item">
              <mat-icon color="primary">payments</mat-icon>
              <div class="detail-content">
                <div class="detail-label">Quick pay</div>
                <div class="detail-value">Enabled</div>
              </div>
            </div>
          </div>
        </mat-card>

        <mat-card class="panel wide">
          <div class="panel__header">
            <div>
              <p class="eyebrow">Notes</p>
              <h3>Driver instructions</h3>
            </div>
          </div>
          <p class="body">{{ load?.notes }}</p>
          <div class="chips">
            @for (tag of load?.tags; track tag) {
              <span class="chip">{{ tag }}</span>
            }
          </div>
        </mat-card>
      </div>
      

      <!-- New Features Section -->
      <!--
      <mat-tab-group class="features-tabs" animationDuration="300ms">
        <mat-tab label="Status Timeline">
          <div class="tab-content">
            <tms-status-timeline [loadId]="loadId"></tms-status-timeline>
          </div>
        </mat-tab>
        
        <mat-tab label="Check Calls">
          <div class="tab-content">
            <tms-check-call-list [loadId]="loadId" [driverId]="'DRV-001'"></tms-check-call-list>
          </div>
        </mat-tab>
        
        <mat-tab label="Notes">
          <div class="tab-content">
            <tms-notes [entityType]="'Load'" [entityId]="loadId"></tms-notes>
          </div>
        </mat-tab>
      </mat-tab-group>
      -->
    </div>
  `,
  styleUrl: './load-details.page.scss'
})
export class LoadDetailsPage implements OnInit, OnDestroy {
  load: LoadDetail | undefined;
  private destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const loadId = params.get('id');
      console.log('Load ID from route:', loadId);
      console.log('Available load IDs:', Object.keys(MOCK_LOAD_DETAILS));
      if (loadId) {
        this.load = MOCK_LOAD_DETAILS[loadId];
        console.log('Loaded data:', this.load);
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async shareLoad(): Promise<void> {
    if (!this.load) {
      this.snackBar.open('No load details to share', 'OK', { duration: 3000 });
      return;
    }

    const shareText = `Load ${this.load.id}: ${this.load.origin} → ${this.load.destination}
Equipment: ${this.load.equipment}
Rate: ${this.load.rate}
Pickup: ${this.load.pickup}
Status: ${this.load.status}`;

    const shareUrl = window.location.href;

    // Try native Web Share API first (mobile browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Load ${this.load.id}`,
          text: shareText,
          url: shareUrl
        });
        this.snackBar.open('Load shared successfully!', 'OK', { duration: 3000 });
      } catch (error: any) {
        // User cancelled share or error occurred
        if (error.name !== 'AbortError') {
          console.error('Share error:', error);
          this.fallbackCopyToClipboard(shareText, shareUrl);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      this.fallbackCopyToClipboard(shareText, shareUrl);
    }
  }

  private async fallbackCopyToClipboard(text: string, url: string): Promise<void> {
    const fullText = `${text}\n\nView details: ${url}`;
    
    try {
      await navigator.clipboard.writeText(fullText);
      this.snackBar.open('Load details copied to clipboard!', 'OK', { duration: 3000 });
    } catch (error) {
      console.error('Clipboard error:', error);
      this.snackBar.open('Unable to share load details', 'OK', { duration: 3000 });
    }
  }
}
