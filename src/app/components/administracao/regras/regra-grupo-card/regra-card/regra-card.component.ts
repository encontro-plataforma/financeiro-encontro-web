import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaterialGlobalModule, MaterialFormsModule } from '../../../../../shared/modules/material.imports.module';
import { Regra, RegraCondicao } from '../../../../../models/regra-grupo.model';
import { TipoDetalhamento } from '../../../../../models/constants/tipo-detalhamento';

/** Condição com um campo transiente (`_teste`) só de UI — nunca é enviado ao
 * backend, serve só pro "testar regex" ao lado de cada condição. */
type RegraCondicaoUI = RegraCondicao & { _teste?: string };

interface ResultadoTeste {
  casa: boolean;
  valor?: string;
}

/** Um card de Regra dentro da "caixa" do grupo — a(s) condição(ões) aparece(m)
 * como propriedade do próprio card, não como uma lista separada visualmente. */
@Component({
  selector: 'app-regra-card',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialGlobalModule, MaterialFormsModule],
  templateUrl: './regra-card.component.html',
  styleUrl: './regra-card.component.scss',
})
export class RegraCardComponent {
  @Input() regra!: Regra;
  @Input() primeira = false;
  @Input() ultima = false;

  @Output() subir = new EventEmitter<void>();
  @Output() descer = new EventEmitter<void>();
  @Output() remover = new EventEmitter<void>();

  readonly tipoOptions = TipoDetalhamento.options;

  get condicoes(): RegraCondicaoUI[] {
    return this.regra.condicoes as RegraCondicaoUI[];
  }

  adicionarCondicao(): void {
    this.condicoes.push({ ordem: this.condicoes.length + 1, padrao_regex: '' });
  }

  removerCondicao(index: number): void {
    this.condicoes.splice(index, 1);
    this.reindexar();
  }

  subirCondicao(index: number): void {
    this.moverCondicao(index, -1);
  }

  descerCondicao(index: number): void {
    this.moverCondicao(index, 1);
  }

  private moverCondicao(index: number, direcao: -1 | 1): void {
    const alvo = index + direcao;
    if (alvo < 0 || alvo >= this.condicoes.length) return;

    const lista = this.condicoes;
    [lista[index], lista[alvo]] = [lista[alvo], lista[index]];
    this.reindexar();
  }

  private reindexar(): void {
    this.condicoes.forEach((c, i) => (c.ordem = i + 1));
  }

  private normalizar(texto: string): string {
    // Mesma normalização do backend (remover_acentos + lower) para o teste
    // ao vivo refletir fielmente o que o motor de regras realmente faz.
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  testar(condicao: RegraCondicaoUI): ResultadoTeste {
    const textoBruto = condicao._teste || '';
    if (!textoBruto || !condicao.padrao_regex) return { casa: false };

    try {
      const re = new RegExp(condicao.padrao_regex, 'i');
      const match = this.normalizar(textoBruto).match(re);
      if (!match) return { casa: false };

      const valor = match.slice(1).find((g) => g !== undefined);
      return { casa: true, valor };
    } catch {
      return { casa: false };
    }
  }
}
