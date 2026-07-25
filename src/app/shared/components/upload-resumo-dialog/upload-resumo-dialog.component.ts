import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MaterialGlobalModule } from '../../modules/material.imports.module';
import { UploadFile } from '../../../models/upload-file.model';

export interface UploadResumoDialogData {
  arquivo: UploadFile;
}

interface ResumoItem {
  chave: string;
  valor: string;
}

const ROTULOS: Record<string, string> = {
  inseridos:   'Inseridos',
  atualizados: 'Atualizados',
  ignorados:   'Ignorados',
  mensagem:    'Mensagem',
};

@Component({
  selector: 'app-upload-resumo-dialog',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule],
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

  get temErro(): boolean {
    return this.arquivo.status === 'ERRO';
  }

  get resumo(): ResumoItem[] {
    if (!this.arquivo.resultado_processamento) return [];
    try {
      const obj = JSON.parse(this.arquivo.resultado_processamento);
      return Object.entries(obj)
        .filter(([chave]) => chave !== 'detalhes_ignorados')
        .map(([chave, valor]) => ({ chave: ROTULOS[chave] ?? chave, valor: String(valor) }));
    } catch {
      return [{ chave: 'Resumo', valor: this.arquivo.resultado_processamento }];
    }
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
