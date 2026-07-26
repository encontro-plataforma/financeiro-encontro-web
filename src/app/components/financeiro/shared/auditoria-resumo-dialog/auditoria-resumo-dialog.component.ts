import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MaterialGlobalModule } from '../../../../shared/modules/material.imports.module';
import { AuditoriaResultado } from '../../../../models/auditoria-resultado.model';

@Component({
  selector: 'app-auditoria-resumo-dialog',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule],
  templateUrl: './auditoria-resumo-dialog.component.html',
  styleUrl: './auditoria-resumo-dialog.component.scss',
})
export class AuditoriaResumoDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AuditoriaResultado,
    private dialogRef: MatDialogRef<AuditoriaResumoDialogComponent>,
  ) {}

  fechar(): void {
    this.dialogRef.close();
  }
}
