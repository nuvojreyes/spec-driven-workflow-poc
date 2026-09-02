import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * The shared "succeeded, nothing to show" presentation.
 *
 * `empty` is a first-class state, not a quiet variant of `loading` or a soft
 * `error`. A request that came back fine with zero results deserves real
 * copy explaining what would put something here — never a blank area, and
 * never the error component.
 */
@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty-state">
      <p class="empty-state__title">{{ title }}</p>
      <p class="empty-state__message">{{ message }}</p>

      <button
        *ngIf="actionLabel"
        type="button"
        class="empty-state__action"
        (click)="action.emit()"
      >
        {{ actionLabel }}
      </button>
    </div>
  `,
  styles: [
    `
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
        padding: 1.35rem 1.5rem;
        border: 1px dashed rgba(148, 197, 255, 0.32);
        border-radius: 18px;
        background: rgba(14, 32, 56, 0.42);
        color: #dce9ff;
      }

      .empty-state__title {
        margin: 0;
        font-weight: 800;
        font-size: 1rem;
      }

      .empty-state__message {
        margin: 0;
        color: rgba(220, 233, 255, 0.72);
        line-height: 1.5;
      }

      .empty-state__action {
        margin-top: 0.35rem;
        padding: 0.6rem 1.15rem;
        border: 1px solid rgba(148, 197, 255, 0.42);
        border-radius: 999px;
        background: transparent;
        color: #dce9ff;
        font-weight: 700;
        cursor: pointer;
      }

      .empty-state__action:focus-visible {
        outline: 3px solid #94c5ff;
        outline-offset: 2px;
      }
    `,
  ],
})
export class EmptyStateComponent {
  @Input() title = 'Nothing here yet';

  /** Say what would make this block non-empty. Avoid "No data". */
  @Input() message = 'There is nothing to show for this selection.';

  /** Omit to render no action. */
  @Input() actionLabel?: string;

  @Output() action = new EventEmitter<void>();
}
