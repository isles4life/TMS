import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ts-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page__header">
      <div>
        <p class="eyebrow" *ngIf="eyebrow">{{ eyebrow }}</p>
        <h1>{{ title }}</h1>
        <p class="lede" *ngIf="description">{{ description }}</p>
      </div>
      <div class="cta-group" *ngIf="hasActions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [`
    .page__header {
      display: flex;
      align-items: flex-start;
      gap: var(--ts-spacing-lg);
      flex-wrap: wrap;
      justify-content: space-between;
    }
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 12px;
      font-weight: 700;
      color: var(--ts-stone);
      margin: 0 0 var(--ts-spacing-sm) 0;
    }
    h1 {
      font-size: 32px;
      font-weight: 800;
      margin: 0 0 var(--ts-spacing-sm) 0;
      color: var(--ts-ink);
    }
    .lede {
      color: var(--ts-stone);
      font-size: 16px;
      margin: 0;
      max-width: 500px;
    }
    .cta-group {
      display: inline-flex;
      gap: var(--ts-spacing-sm);
      flex-wrap: wrap;
    }
  `]
})
export class PageHeaderComponent {
  @Input() eyebrow?: string;
  @Input() title!: string;
  @Input() description?: string;
  @Input() hasActions = false;
}
