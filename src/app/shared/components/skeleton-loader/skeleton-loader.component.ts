import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  template: `
    <div class="skeleton-wrapper" [style.gap.px]="gap">
      @for (row of rows; track $index) {
        <div
          class="skeleton-line"
          [style.width]="row"
          [style.height.px]="height"
          [style.borderRadius.px]="radius"
          [style.animationDelay]="($index * 0.1) + 's'"
        ></div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }

    .skeleton-wrapper {
      display: flex;
      flex-direction: column;
    }

    .skeleton-line {
      background: linear-gradient(
        90deg,
        var(--color-surface-2) 0%,
        var(--color-surface-3) 40%,
        var(--color-surface-2) 80%
      );
      background-size: 200% 100%;
      animation: skeleton-shimmer 1.8s ease-in-out infinite;
    }

    @keyframes skeleton-shimmer {
      0% { background-position: 200% center; }
      100% { background-position: -200% center; }
    }
  `]
})
export class SkeletonLoaderComponent {
  @Input() count: number = 3;
  @Input() height: number = 14;
  @Input() gap: number = 10;
  @Input() radius: number = 6;
  @Input() widths: string[] = ['100%', '80%', '60%'];

  get rows(): string[] {
    const result: string[] = [];
    for (let i = 0; i < this.count; i++) {
      result.push(this.widths[i % this.widths.length]);
    }
    return result;
  }
}
