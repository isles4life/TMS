import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageHeaderComponent } from '../components/page-header.component';

interface Integration {
  id: string;
  name: string;
  company: string;
  description: string;
  icon: string;
  enabled: boolean;
  apiKey?: string;
  website: string;
}

@Component({
  selector: 'app-marketplace-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatTooltipModule,
    MatSnackBarModule,
    PageHeaderComponent,
  ],
  template: `
    <div class="page">
      <app-ts-page-header
        eyebrow="Integrations"
        title="Marketplace"
        description="Connect with industry-leading load board platforms to expand your reach."
        [hasActions]="false">
      </app-ts-page-header>

      <div class="integrations-container">
        <div class="integrations-grid">
          @for (integration of integrations; track integration.id) {
            <mat-card 
              class="integration-card"
              [class.enabled]="integration.enabled">
            
            <mat-card-header>
              <div class="header-content">
                <div class="company-info">
                  <div class="icon-wrapper">
                    <img [src]="integration.icon" alt="{{ integration.name }} logo" class="company-logo">
                  </div>
                  <div>
                    <h3>{{ integration.name }}</h3>
                    <p class="company-name">{{ integration.company }}</p>
                  </div>
                </div>
                <mat-slide-toggle 
                  [checked]="integration.enabled"
                  (change)="toggleIntegration(integration)"
                  matTooltip="Enable/Disable this integration">
                </mat-slide-toggle>
              </div>
            </mat-card-header>

            <mat-card-content>
              <p class="description">{{ integration.description }}</p>

              <mat-expansion-panel [disabled]="!integration.enabled" class="api-config">
                <mat-expansion-panel-header>
                  <mat-panel-title>
                    <mat-icon>settings</mat-icon> API Configuration
                  </mat-panel-title>
                </mat-expansion-panel-header>

                <form [formGroup]="getIntegrationForm(integration.id)" (ngSubmit)="saveApiKey(integration)">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>API Key</mat-label>
                    <input 
                      matInput 
                      type="password" 
                      [formControl]="getApiKeyControl(integration.id)"
                      placeholder="Enter your API key">
                    <mat-hint>Your API key is encrypted and stored securely</mat-hint>
                  </mat-form-field>

                  <div class="form-actions">
                    <button 
                      mat-stroked-button 
                      type="button"
                      (click)="resetApiKey(integration)">
                      Clear
                    </button>
                    <button 
                      mat-flat-button 
                      color="primary" 
                      type="submit"
                      [disabled]="!getApiKeyControl(integration.id).value">
                      Save API Key
                    </button>
                  </div>

                  <div class="api-status">
                    @if (integration.apiKey) {
                      <mat-icon class="status-icon success">check_circle</mat-icon>
                    }
                    @if (integration.apiKey) {
                      <span class="status-text">API Key Configured</span>
                    }
                    @if (!integration.apiKey && integration.enabled) {
                      <span class="status-text warning">Pending Configuration</span>
                    }
                  </div>
                </form>
              </mat-expansion-panel>

              <div class="integration-links">
                <a [href]="integration.website" target="_blank" rel="noopener noreferrer" mat-button>
                  <mat-icon>open_in_new</mat-icon> Visit {{ integration.company }}
                </a>
              </div>
            </mat-card-content>
            </mat-card>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      padding: var(--ts-spacing-lg);
    }

    .integrations-container {
      margin-top: var(--ts-spacing-lg);
    }

    .integrations-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: var(--ts-spacing-lg);
    }

    .integration-card {
      border: 1px solid var(--ts-border);
      border-radius: 14px;
      transition: all 0.3s ease;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    }

    .integration-card.enabled {
      border-color: var(--ts-primary, #0066cc);
      box-shadow: 0 4px 16px rgba(0, 102, 204, 0.12);
    }

    mat-card-header {
      padding: var(--ts-spacing-md) var(--ts-spacing-md) 0 var(--ts-spacing-md);
      margin: 0;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
      gap: var(--ts-spacing-md);
    }

    .company-info {
      display: flex;
      gap: var(--ts-spacing-md);
      align-items: flex-start;
      flex: 1;
    }

    .icon-wrapper {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: var(--ts-neutral-50, #f9fafb);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      overflow: hidden;
    }

    .company-logo {
      width: 56px;
      height: 56px;
      border-radius: 8px;
      object-fit: cover;
    }

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: var(--ts-ink);
    }

    .company-name {
      margin: 4px 0 0 0;
      font-size: 12px;
      color: var(--ts-stone);
      font-weight: 500;
    }

    mat-card-content {
      padding: var(--ts-spacing-md);
    }

    .description {
      margin: 0 0 var(--ts-spacing-md) 0;
      font-size: 14px;
      color: var(--ts-stone);
      line-height: 1.5;
    }

    .api-config {
      margin: var(--ts-spacing-md) 0;
    }

    .full-width {
      width: 100%;
      margin-bottom: var(--ts-spacing-md);
    }

    .form-actions {
      display: flex;
      gap: var(--ts-spacing-sm);
      margin-bottom: var(--ts-spacing-md);
    }

    .api-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: var(--ts-spacing-sm);
      border-radius: 8px;
      background: var(--ts-neutral-50, #f9fafb);
      margin-top: var(--ts-spacing-md);
    }

    .status-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .status-icon.success {
      color: var(--ts-positive, #00b341);
    }

    .status-text {
      font-size: 13px;
      font-weight: 500;
    }

    .status-text.warning {
      color: var(--ts-caution, #ff9800);
    }

    .integration-links {
      margin-top: var(--ts-spacing-md);
      padding-top: var(--ts-spacing-md);
      border-top: 1px solid var(--ts-border);
      text-align: center;
    }

    mat-panel-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      font-weight: 600;
    }

    ::ng-deep .mat-mdc-expansion-panel-header {
      background-color: var(--ts-neutral-50, #f9fafb) !important;
    }
  `]
})
export class MarketplacePage implements OnInit {
  integrations: Integration[] = [
    {
      id: 'truckstop',
      name: 'Truckstop',
      company: 'Truckstop.com',
      description: 'Access thousands of loads from the largest marketplace for spot market freight.',
      icon: 'data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect fill="%230066cc" width="100" height="100" rx="10"/><text x="50" y="65" text-anchor="middle" font-size="40" font-weight="bold" fill="white">TS</text></svg>',
      enabled: false,
      website: 'https://www.truckstop.com'
    },
    {
      id: 'dat',
      name: 'DAT',
      company: 'DAT One',
      description: 'Connect to the DAT load board and gain access to exclusive freight opportunities.',
      icon: 'data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect fill="%23FF6B35" width="100" height="100" rx="10"/><text x="50" y="65" text-anchor="middle" font-size="40" font-weight="bold" fill="white">DAT</text></svg>',
      enabled: false,
      website: 'https://www.dat.com'
    },
    {
      id: 'nextload',
      name: 'Nextload',
      company: 'Nextload Freight',
      description: 'Real-time freight marketplace with direct shipper and broker connections.',
      icon: 'data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect fill="%2304A777" width="100" height="100" rx="10"/><text x="50" y="65" text-anchor="middle" font-size="35" font-weight="bold" fill="white">NL</text></svg>',
      enabled: false,
      website: 'https://www.nextload.com'
    },
    {
      id: 'loadclimber',
      name: 'Load Climber',
      company: 'Fortive Technologies',
      description: 'Spot market load board with live booking and real-time tracking features.',
      icon: 'data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect fill="%23F7931E" width="100" height="100" rx="10"/><text x="50" y="65" text-anchor="middle" font-size="35" font-weight="bold" fill="white">LC</text></svg>',
      enabled: false,
      website: 'https://www.loadclimber.com'
    },
    {
      id: 'posting',
      name: 'Posting',
      company: 'Posting Transport Network',
      description: 'Direct connection to shippers and brokers on the Posting network platform.',
      icon: 'data:image/svg+xml;utf8,<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><rect fill="%235B2E8F" width="100" height="100" rx="10"/><text x="50" y="65" text-anchor="middle" font-size="35" font-weight="bold" fill="white">PTN</text></svg>',
      enabled: false,
      website: 'https://www.posting.com'
    }
  ];

  apiKeyForms = new Map<string, FormGroup>();

  constructor(private snackBar: MatSnackBar, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadIntegrationSettings();
  }

  private initializeForms(): void {
    this.integrations.forEach(integration => {
      this.apiKeyForms.set(integration.id, this.fb.group({
        apiKey: ['', Validators.required]
      }));
    });
  }

  private loadIntegrationSettings(): void {
    // Load saved integration settings from localStorage
    this.integrations.forEach(integration => {
      const saved = localStorage.getItem(`integration_${integration.id}`);
      if (saved) {
        const data = JSON.parse(saved);
        integration.enabled = data.enabled;
        integration.apiKey = data.apiKey;
        if (data.apiKey) {
          this.getApiKeyControl(integration.id).setValue(data.apiKey);
        }
      }
    });
  }

  toggleIntegration(integration: Integration): void {
    integration.enabled = !integration.enabled;
    this.saveIntegrationSettings(integration);
    const message = integration.enabled ? `${integration.name} enabled` : `${integration.name} disabled`;
    this.snackBar.open(message, 'Close', { duration: 2000 });
  }

  getIntegrationForm(integrationId: string): FormGroup {
    return this.apiKeyForms.get(integrationId)!;
  }

  getApiKeyControl(integrationId: string): FormControl {
    return this.apiKeyForms.get(integrationId)!.get('apiKey')! as FormControl;
  }

  saveApiKey(integration: Integration): void {
    const control = this.getApiKeyControl(integration.id);
    if (control.valid) {
      integration.apiKey = control.value;
      this.saveIntegrationSettings(integration);
      this.snackBar.open(`API Key saved for ${integration.name}`, 'Close', { duration: 3000 });
    }
  }

  resetApiKey(integration: Integration): void {
    integration.apiKey = undefined;
    this.getApiKeyControl(integration.id).reset();
    this.saveIntegrationSettings(integration);
    this.snackBar.open(`API Key cleared for ${integration.name}`, 'Close', { duration: 2000 });
  }

  private saveIntegrationSettings(integration: Integration): void {
    const data = {
      enabled: integration.enabled,
      apiKey: integration.apiKey || null
    };
    localStorage.setItem(`integration_${integration.id}`, JSON.stringify(data));
  }
}
