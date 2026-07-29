import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MaterialGlobalModule } from '../../../shared/modules/material.imports.module';
import { UploadResumoComponent } from '../../../shared/components/upload-resumo/upload-resumo.component';
import { UploadFile } from '../../../models/upload-file.model';

export interface UploadResumoDialogData {
  arquivo: UploadFile;
}

@Component({
  selector: 'app-upload-resumo-dialog',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule, UploadResumoComponent],
  templateUrl: './upload-resumo-dialog.component.html',
  styleUrl: './upload-resumo-dialog.component.scss',
})
export class UploadResumoDialogComponent {
  arquivo: UploadFile;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UploadResumoDialogData,
    private dialogRef: MatDialogRef<UploadResumoDialogComponent>,
  ) {
    this.arquivo = data.arquivo;
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
