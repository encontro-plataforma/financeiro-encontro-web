import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialGlobalModule } from '../../modules/material.imports.module';

export interface ConfirmDialogData {
  title:         string;
  message:       string;
  confirmLabel?: string;
  cancelLabel?:  string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MaterialGlobalModule],
  template: `
    <h2 mat-dialog-title class="confirm-dialog-title">{{ data.title }}</h2>

    <mat-dialog-content>
      <p>{{ data.message }}</p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button class="confirm-dialog-btn" (click)="cancel()">
        {{ data.cancelLabel ?? 'Cancelar' }}
      </button>
      <button mat-flat-button color="warn" class="confirm-dialog-btn" (click)="confirm()">
        {{ data.confirmLabel ?? 'Confirmar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .confirm-dialog-title {
      display: flex;
      align-items: center;
    }

    .confirm-dialog-btn {
      border-radius: 8px;
    }

    mat-dialog-content p {
      margin: 0;
      color: var(--mat-sys-on-surface-variant);
    }
    mat-dialog-actions {
      gap: 0.5rem;
      padding-bottom: 1rem;
    }
  `],
})
export class ConfirmDialogComponent {
  data: ConfirmDialogData = inject(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<ConfirmDialogComponent>);

  confirm(): void { this.ref.close(true); }
  cancel():  void { this.ref.close(false); }
}
