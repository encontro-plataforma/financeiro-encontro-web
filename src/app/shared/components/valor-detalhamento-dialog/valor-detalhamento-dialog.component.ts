import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialGlobalModule, MaterialFormsModule } from '../../modules/material.imports.module';

export interface ValorDetalhamentoDialogData {
  titulo: string;
  valorSugerido: number;
  valorMaximo: number;
}

@Component({
  selector: 'app-valor-detalhamento-dialog',
  standalone: true,
  imports: [FormsModule, MaterialGlobalModule, MaterialFormsModule],
  template: `
    <h2 mat-dialog-title>{{ data.titulo }}</h2>

    <mat-dialog-content>
      <mat-form-field appearance="outline" floatLabel="always" class="w-full">
        <mat-label>Valor</mat-label>
        <span matPrefix>R$&nbsp;</span>
        <input
          matInput
          type="number"
          [(ngModel)]="valor"
          min="0.01"
          [max]="data.valorMaximo"
          step="0.01"
          autofocus
        />
      </mat-form-field>

      @if (erro) {
        <p class="valor-dialog-erro">{{ erro }}</p>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="!!erro || valor === null" (click)="confirmar()">
        Confirmar
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .w-full {
      width: 100%;
    }
    .valor-dialog-erro {
      margin: 0;
      color: var(--mat-sys-error);
      font-size: 0.85rem;
    }
    mat-dialog-actions {
      gap: 0.5rem;
      padding-bottom: 1rem;
    }
  `],
})
export class ValorDetalhamentoDialogComponent {
  data: ValorDetalhamentoDialogData = inject(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<ValorDetalhamentoDialogComponent, number>);

  valor: number | null = this.data.valorSugerido;

  get erro(): string | null {
    if (this.valor === null || this.valor === undefined) return 'Informe um valor.';
    if (this.valor <= 0) return 'O valor deve ser maior que zero.';
    if (this.valor > this.data.valorMaximo) {
      return `O valor não pode ultrapassar R$ ${this.data.valorMaximo.toFixed(2)} (limite disponível).`;
    }
    return null;
  }

  confirmar(): void {
    if (this.erro || this.valor === null) return;
    this.ref.close(this.valor);
  }

  cancelar(): void {
    this.ref.close();
  }
}
