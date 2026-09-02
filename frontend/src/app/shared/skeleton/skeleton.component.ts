import { Component, Input } from '@angular/core';

/**
 * The shared loading placeholder.
 *
 * Size it to the footprint of the content it stands in for: the block must
 * not change height when data arrives. Shapes are `aria-hidden`, and the
 * announcement for assistive technology is made once by the container that
 * owns the block via `aria-busy` and a `role="status"` message — not by every
 * shape in here.
 *
 * Reuse this instead of adding a spinner. A bare spinner says "something is
 * happening" and nothing about what is about to appear.
 */
@Component({
  selector: 'app-skeleton',
  template: `
    <div class="skeleton" aria-hidden="true">
      <div *ngIf="heading" class="skeleton__bar skeleton__bar--heading"></div>
      <div
        *ngFor="let line of lineArray"
        class="skeleton__bar"
        [style.width.%]="line"
      ></div>
    </div>
  `,
  styles: [
    `
      .skeleton {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
        width: 100%;
      }

      .skeleton__bar {
        height: 0.85rem;
        border-radius: 999px;
        background: linear-gradient(
          90deg,
          rgba(148, 197, 255, 0.1) 0%,
          rgba(148, 197, 255, 0.22) 50%,
          rgba(148, 197, 255, 0.1) 100%
        );
        background-size: 200% 100%;
        animation: skeleton-sweep 1.4s ease-in-out infinite;
      }

      .skeleton__bar--heading {
        height: 1.8rem;
        width: 55%;
        margin-bottom: 0.4rem;
      }

      @keyframes skeleton-sweep {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }

      /* Respect a reduced-motion preference: the placeholder still reads as
         a placeholder without the sweep. */
      @media (prefers-reduced-motion: reduce) {
        .skeleton__bar {
          animation: none;
        }
      }
    `,
  ],
})
export class SkeletonComponent {
  /** Number of body lines to draw. */
  @Input() lines = 3;

  /** Draw a wider bar first, standing in for a title. */
  @Input() heading = false;

  /** Descending widths, so the placeholder reads as text rather than a grid. */
  get lineArray(): number[] {
    const widths = [100, 92, 78, 85, 70, 96];
    return Array.from({ length: Math.max(0, this.lines) }, (_, i) => widths[i % widths.length]);
  }
}
