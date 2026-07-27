import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MaterialGlobalModule } from '../../modules/material.imports.module';
import { UploadErrosTableComponent } from '../upload-erros-table/upload-erros-table.component';
import { UploadTotaisCardsComponent } from '../upload-totais-cards/upload-totais-cards.component';
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
  imports: [CommonModule, MaterialGlobalModule, UploadErrosTableComponent, UploadTotaisCardsComponent],
  templateUrl: './upload-resumo-dialog.component.html',
  styleUrl: './upload-resumo-dialog.component.scss',
})
export class UploadResumoDialogComponent {
  arquivo: UploadFile;

  // Calculados uma única vez no construtor (não getters): um getter que reparseia o
  // JSON a cada change detection devolveria um array novo a cada vez e resetaria a
  // paginação da tabela de erros (o [erros] do filho dispararia ngOnChanges a cada CD).
  mensagem: string | null;
  resumo: UploadResumoItem[];
  errosDetalhados: UploadErroProcessamento[];
  temErro: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: UploadResumoDialogData,
    private dialogRef: MatDialogRef<UploadResumoDialogComponent>,
  ) {
    this.arquivo = data.arquivo;
    this.mensagem = parseMensagemProcessamento(this.arquivo.resultado_processamento);
    this.resumo = parseResumoProcessamento(this.arquivo.resultado_processamento);
    this.errosDetalhados = parseErrosProcessamento(this.arquivo.resultado_processamento);
    this.temErro = this.arquivo.status === 'ERRO' || this.errosDetalhados.length > 0;
  }

  fechar(): void {
    this.dialogRef.close();
  }
}
