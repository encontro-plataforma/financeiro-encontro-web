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

export interface UploadResumoInfo {
  temErro: boolean;
  dialogWidth: string;
  dialogHeight?: string;
}

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
  // Tamanho do dialog (CsvUploadDialogComponent ou UploadResumoDialogComponent) quando
  // exibindo este componente. Privados: quem abre o dialog não escolhe o tamanho, só
  // chama UploadResumoComponent.getInfo(upload) e usa o que vier de volta — assim os
  // dois dialogs se comportam sempre igual, sem cada tela decidir por conta própria.
  private static readonly WIDTH = '680px';
  private static readonly WIDTH_ERRO = '80vw';
  private static readonly HEIGHT_ERRO = '90vh';

  /**
   * A partir do UploadFile, diz se o resumo tem erros e qual largura/altura o dialog
   * que for exibi-lo deve usar. Sem erro: largo o bastante para os cards de totais
   * caberem numa linha só, altura livre (encolhe para o conteúdo). Com erro: bem maior
   * nos dois eixos, para caber a tabela de erros embaixo.
   */
  static getInfo(upload: UploadFile): UploadResumoInfo {
    const temErro = upload.status === 'ERRO' || parseErrosProcessamento(upload.resultado_processamento).length > 0;

    return temErro
      ? { temErro, dialogWidth: this.WIDTH_ERRO, dialogHeight: this.HEIGHT_ERRO }
      : { temErro, dialogWidth: this.WIDTH };
  }

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
