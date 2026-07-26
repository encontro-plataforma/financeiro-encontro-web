import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MaterialGlobalModule, MaterialFormsModule } from '../../../../shared/modules/material.imports.module';
import { CurrencyBRPipe } from '../../../../shared/pipes/currency-br.pipe';

export interface ConciliarRestoDialogData {
  valorTotal:      number;
  somaDetalhamentos: number;
  resto:           number;
  descricaoPadrao: string;
}

export interface ConciliarRestoDialogResult {
  descricao: string;
}

@Component({
  selector: 'app-conciliar-resto-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialGlobalModule, MaterialFormsModule, CurrencyBRPipe],
  templateUrl: './conciliar-resto-dialog.component.html',
  styleUrl: './conciliar-resto-dialog.component.scss',
})
export class ConciliarRestoDialogComponent {
  descricao: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ConciliarRestoDialogData,
    private dialogRef: MatDialogRef<ConciliarRestoDialogComponent, ConciliarRestoDialogResult | false>,
  ) {
    this.descricao = data.descricaoPadrao;
  }

  confirmar(): void {
    this.dialogRef.close({ descricao: this.descricao });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
