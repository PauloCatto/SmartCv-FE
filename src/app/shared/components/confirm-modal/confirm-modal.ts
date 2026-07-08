import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  template: `
    <div class="modal-backdrop" (click)="onCancel()">
      <div class="modal-dialog" (click)="$event.stopPropagation()">
        <div class="modal-icon" [class]="type">
          @if (type === 'danger') {
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          } @else {
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          }
        </div>
        <h3 class="modal-title">{{ title }}</h3>
        <p class="modal-message">{{ message }}</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" (click)="onCancel()">{{ cancelText }}</button>
          <button class="btn" [class]="type === 'danger' ? 'btn-danger-solid' : 'btn-primary'" (click)="onConfirm()">
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(6px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      animation: fadeIn 0.2s ease;
    }

    .modal-dialog {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: 32px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      animation: fadeInUp 0.3s ease;
      box-shadow: var(--shadow-lg);
    }

    .modal-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;

      &.danger {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
      }

      &.warning {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
      }

      &.info {
        background: rgba(99, 102, 241, 0.15);
        color: #6366f1;
      }
    }

    .modal-title {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-text);
      margin-bottom: 8px;
    }

    .modal-message {
      font-size: 14px;
      color: var(--color-text-muted);
      line-height: 1.6;
      margin-bottom: 24px;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      justify-content: center;

      .btn {
        flex: 1;
        max-width: 160px;
      }
    }

    .btn-danger-solid {
      background: #ef4444;
      color: white;
      border: none;

      &:hover:not(:disabled) {
        background: #dc2626;
        box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
        transform: translateY(-1px);
      }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ConfirmModalComponent {
  @Input() title: string = 'Confirmar ação';
  @Input() message: string = 'Tem certeza que deseja continuar?';
  @Input() confirmText: string = 'Confirmar';
  @Input() cancelText: string = 'Cancelar';
  @Input() type: 'danger' | 'warning' | 'info' = 'danger';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
