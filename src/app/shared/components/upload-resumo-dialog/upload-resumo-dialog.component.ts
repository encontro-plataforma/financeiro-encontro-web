import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MaterialGlobalModule } from '../../modules/material.imports.module';
import { UploadErrosTableComponent } from '../upload-erros-table/upload-erros-table.component';
import {
  UploadErroProcessamento,
  UploadFile,
  UploadResumoItem,
  parseErrosProcessamento,
  parseMensagemProcessamento,
  parseResumoProcessamento,
} from '../../../models/upload-file.model';

export interface UploadResumoDialogData {
  arquivo: UploadFile;
}

@Component({
  selector: 'app-upload-resumo-dialog',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule, UploadErrosTableComponent],
  templateUrl: './upload-resumo-dialog.component.html',
  styleUrl: './upload-resumo-dialog.component.scss',
})
export class UploadResumoDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UploadResumoDialogData,
    private dialogRef: MatDialogRef<UploadResumoDialogComponent>,
  ) {}

  get arquivo(): UploadFile {
    return this.data.arquivo;
  }

  get mensagem(): string | null {
    return parseMensagemProcessamento(this.arquivo.resultado_processamento);
  }

  get errosDetalhados(): UploadErroProcessamento[] {
    return parseErrosProcessamento(this.arquivo.resultado_processamento);
  }

  get resumo(): UploadResumoItem[] {
    return parseResumoProcessamento(this.arquivo.resultado_processamento);
  }

  get temErro(): boolean {
    return this.arquivo.status === 'ERRO' || this.errosDetalhados.length > 0;
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
