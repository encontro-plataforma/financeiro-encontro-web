import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialGlobalModule } from '../../../modules/material.imports.module';
import { UploadResumoItem } from '../../../../models/upload-file.model';

export type UploadTabelaTipo = 'erros' | 'duplicados' | 'inseridos' | 'ignorados';

const CHAVES_CLICAVEIS: readonly UploadTabelaTipo[] = ['erros', 'duplicados', 'inseridos', 'ignorados'];

@Component({
  selector: 'app-upload-totais-cards',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule],
  templateUrl: './upload-totais-cards.component.html',
  styleUrl: './upload-totais-cards.component.scss',
})
export class UploadTotaisCardsComponent {
  @Input() totais: UploadResumoItem[] = [];
  /** Qual tabela está sendo exibida no momento — usado só pra destacar o card ativo. */
  @Input() tabelaAtiva: UploadTabelaTipo | null = null;
  /** Emitido quando o usuário clica num card de erros/duplicados com valor > 0. */
  @Output() selecionar = new EventEmitter<UploadTabelaTipo>();

  tipoCard(item: UploadResumoItem): UploadTabelaTipo | null {
    return CHAVES_CLICAVEIS.includes(item.key as UploadTabelaTipo) ? (item.key as UploadTabelaTipo) : null;
  }

  /** Só os cards de erros/duplicados/inseridos/ignorados com valor > 0 viram clicáveis e ganham cor. */
  clicavel(item: UploadResumoItem): boolean {
    return this.tipoCard(item) !== null && Number(item.valor) > 0;
  }

  onCardClick(item: UploadResumoItem): void {
    const tipo = this.tipoCard(item);
    if (tipo && this.clicavel(item)) this.selecionar.emit(tipo);
  }
}
