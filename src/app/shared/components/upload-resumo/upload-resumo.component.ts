import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialGlobalModule } from '../../modules/material.imports.module';
import { UploadErrosTableComponent } from './upload-erros-table/upload-erros-table.component';
import { UploadTotaisCardsComponent } from './upload-totais-cards/upload-totais-cards.component';
import {
  UploadErroProcessamento,
  UploadFile,
  UploadResumoItem,
  parseErrosProcessamento,
  parseMensagemProcessamento,
  parseResumoProcessamento,
} from '../../../models/upload-file.model';

/**
 * Corpo visual do resumo de um upload processado (nome do arquivo, mensagem em
 * destaque, cards de totais e tabela de erros quando houver). Usado tanto pelo
 * passo final do CsvUploadDialogComponent quanto pelo UploadResumoDialogComponent
 * (histórico) — é o mesmo resumo em ambos os lugares, com ou sem erros.
 */
@Component({
  selector: 'app-upload-resumo',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule, UploadErrosTableComponent, UploadTotaisCardsComponent],
  templateUrl: './upload-resumo.component.html',
  styleUrl: './upload-resumo.component.scss',
})
export class UploadResumoComponent implements OnChanges {
  @Input({ required: true }) upload!: UploadFile;

  // Calculados uma única vez quando `upload` muda (não getters): um getter que
  // reparseia o JSON a cada change detection devolveria um array novo a cada vez e
  // resetaria a paginação da tabela de erros (o [erros] do filho dispararia
  // ngOnChanges a cada CD).
  mensagem: string | null = null;
  resumo: UploadResumoItem[] = [];
  errosDetalhados: UploadErroProcessamento[] = [];
  temErro = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['upload']) return;

    this.mensagem = parseMensagemProcessamento(this.upload.resultado_processamento);
    this.resumo = parseResumoProcessamento(this.upload.resultado_processamento);
    this.errosDetalhados = parseErrosProcessamento(this.upload.resultado_processamento);
    this.temErro = this.upload.status === 'ERRO' || this.errosDetalhados.length > 0;
  }
}
