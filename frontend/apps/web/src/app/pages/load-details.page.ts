import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeaderComponent } from '../components/page-header.component';
import { ActivatedRoute } from '@angular/router';

type LoadDetail = {
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
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, PageHeaderComponent],
  template: `
    <div class="page">
      <ts-page-header 
        eyebrow="Load detail" 
        [title]="title"
        [description]="description"
        [hasActions]="true">
        <button mat-stroked-button color="primary">Share</button>
      </ts-page-header>

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
            <span class="chip" *ngFor="let tag of load?.tags">{{ tag }}</span>
          </div>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .detail-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: var(--ts-spacing-lg); }
    .panel { padding: var(--ts-spacing-lg); border: 1px solid var(--ts-border); border-radius: 14px; box-shadow: 0 6px 18px rgba(0,0,0,0.06); background: #fff; display: grid; gap: var(--ts-spacing-sm); }
    .wide { grid-column: span 2; }
    .detail-list { display: flex; flex-direction: column; gap: var(--ts-spacing-md); }
    .detail-item { display: flex; align-items: flex-start; gap: var(--ts-spacing-md); }
    .detail-item mat-icon { flex-shrink: 0; margin-top: 2px; }
    .detail-content { display: flex; flex-direction: column; gap: 4px; }
    .detail-label { font-weight: 600; color: var(--ts-ink); }
    .detail-value { color: var(--ts-stone); font-weight: 600; }
    .chips { display: flex; gap: var(--ts-spacing-sm); flex-wrap: wrap; align-items: center; }
    .chip { background: var(--ts-red); color: #fff; padding: 6px 12px; border-radius: 4px; font-weight: 600; font-size: clamp(12px, 2vw, 14px); white-space: nowrap; flex: 0 1 auto; }
    @media (max-width: 960px) { 
      .wide { grid-column: span 1; }
      .chip { padding: 5px 10px; font-size: 12px; }
    }
    @media (max-width: 640px) {
      .chips { gap: var(--ts-spacing-xs, 4px); }
      .chip { padding: 4px 8px; font-size: 11px; }
    }
  `]
})
export class LoadDetailsPage implements OnInit {
  loadId = '';
  load: LoadDetail | undefined;
  title = '';
  description = 'Flat, clean, WCAG-aligned layout with grouped information.';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.loadId = this.route.snapshot.paramMap.get('id') ?? 'Load';
    this.load = MOCK_LOAD_DETAILS[this.loadId] ?? Object.values(MOCK_LOAD_DETAILS)[0];
    this.title = `${this.load?.id ?? this.loadId} · ${this.load?.origin} → ${this.load?.destination}`;
  }
}
