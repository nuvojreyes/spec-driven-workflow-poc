import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

import { AppError } from '../../core/async-state';

/**
 * The shared failure presentation.
 *
 * Takes an already-normalized `AppError` — see `core/http-error.ts`. It never
 * formats a status code or a stack trace, because a raw error string is not a
 * state, it is a leak.
 *
 * It announces itself with `role="alert"` and moves focus to the retry
 * control, so a keyboard or screen-reader user learns the block failed
 * instead of waiting on content that will never arrive. It stays inside its
 * block's own boundaries: a failing widget must not blank the page around it.
 */
@Component({
  selector: 'app-error-state',
  template: `
    <div class="error-state" role="alert">
      <p class="error-state__title">{{ title }}</p>
      <p class="error-state__message">{{ error.message }}</p>

      <button
        #retryButton
        type="button"
        class="error-state__retry"
        (click)="retry.emit()"
      >
        {{ retryLabel }}
      </button>

      <p *ngIf="error.status" class="error-state__meta">
        {{ error.code }} · HTTP {{ error.status }}
      </p>
    </div>
  `,
  styles: [
    `
      .error-state {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.55rem;
        padding: 1.35rem 1.5rem;
        border: 1px solid rgba(255, 141, 141, 0.35);
        border-radius: 18px;
        background: rgba(84, 20, 28, 0.32);
        color: #ffdede;
      }

      .error-state__title {
        margin: 0;
        font-weight: 800;
        font-size: 1rem;
      }

      .error-state__message {
        margin: 0;
        color: rgba(255, 222, 222, 0.82);
        line-height: 1.5;
      }

      .error-state__retry {
        margin-top: 0.35rem;
        padding: 0.6rem 1.15rem;
        border: 0;
        border-radius: 999px;
        background: #ff8d8d;
        color: #3a0b12;
        font-weight: 800;
        cursor: pointer;
      }

      .error-state__retry:focus-visible {
        outline: 3px solid #ffdede;
        outline-offset: 2px;
      }

      .error-state__meta {
        margin: 0;
        font-size: 0.75rem;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: rgba(255, 222, 222, 0.5);
      }
    `,
  ],
})
export class ErrorStateComponent implements AfterViewInit {
  /** The normalized failure. Required — never pass a raw response. */
  @Input({ required: true }) error!: AppError;

  /** Heading above the message. Override to name the block that failed. */
  @Input() title = 'Could not load this';

  /** Action-naming label. "Try again" beats "OK". */
  @Input() retryLabel = 'Try again';

  /** Emitted when the person asks for another attempt. */
  @Output() retry = new EventEmitter<void>();

  @ViewChild('retryButton') private retryButton?: ElementRef<HTMLButtonElement>;

  ngAfterViewInit(): void {
    // The block just replaced its content with a failure. Focus is likely
    // still on whatever triggered the request, or nowhere useful, so move it
    // to the one control that resolves the situation.
    this.retryButton?.nativeElement.focus();
  }
}
