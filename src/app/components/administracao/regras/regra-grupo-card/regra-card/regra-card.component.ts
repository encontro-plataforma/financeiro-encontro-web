import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaterialGlobalModule } from '../../../../../shared/modules/material.imports.module';
import { Regra } from '../../../../../models/regra-grupo.model';
import { TipoDetalhamento } from '../../../../../models/constants/tipo-detalhamento';

/** Card de exibição de 1 Regra dentro da caixa do grupo — só leitura, sem
 * nenhuma edição inline. Criar/editar Regra e gerenciar suas condições
 * acontecem em dialogs, abertos pelo pai (regra-grupo-card). */
@Component({
  selector: 'app-regra-card',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialGlobalModule],
  templateUrl: './regra-card.component.html',
  styleUrl: './regra-card.component.scss',
})
export class RegraCardComponent {
  @Input() regra!: Regra;
  @Input() primeira = false;
  @Input() ultima = false;

  @Output() subir = new EventEmitter<void>();
  @Output() descer = new EventEmitter<void>();
  @Output() editar = new EventEmitter<void>();
  @Output() ativoChange = new EventEmitter<boolean>();
  @Output() gerenciarCondicoes = new EventEmitter<void>();
  @Output() excluirCondicao = new EventEmitter<number>();
  @Output() excluir = new EventEmitter<void>();

  get tipoDescricao(): string {
    return TipoDetalhamento.getDescription(this.regra.tipo_detalhamento_resultado);
  }

  get usaCondicoes(): boolean {
    return this.regra.modo_extracao === 'TOKEN_VALOR';
  }

  get naoPodeAtivar(): boolean {
    return this.usaCondicoes && !this.regra.condicoes.length;
  }
}
