import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MaterialGlobalModule } from '../../../../shared/modules/material.imports.module';

export interface UploadDialogData {
  nomeArquivo: string;
  inseridos:   number;
  duplicados:  number;
  erros:       number;
}

@Component({
  selector: 'app-conciliacao-upload-dialog',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule],
  templateUrl: './conciliacao-upload-dialog.component.html',
  styleUrl:    './conciliacao-upload-dialog.component.scss',
})
export class ConciliacaoUploadDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UploadDialogData,
    private dialogRef: MatDialogRef<ConciliacaoUploadDialogComponent>,
    private router: Router,
  ) {}

  fechar(): void {
    this.dialogRef.close();
  }

  conciliarLancamentos(): void {
    this.dialogRef.close();
    this.router.navigate(['/conciliacao/conciliar']);
  }
}
