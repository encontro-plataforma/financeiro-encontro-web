import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MaterialGlobalModule, MaterialFormsModule } from '../../../../shared/modules/material.imports.module';
import { RegraCondicao } from '../../../../models/regra-grupo.model';

export interface CondicoesDialogData {
  regraNome: string;
  condicoes: RegraCondicao[];
}

/** Condição com um campo transiente (`_teste`) só de UI — nunca é enviado ao
 * backend, serve só pro "testar regex" ao lado de cada condição. */
type RegraCondicaoUI = RegraCondicao & { _teste?: string };

interface ResultadoTeste {
  casa: boolean;
  valor?: string;
}

/** Gerencia a lista de RegraCondicao de 1 Regra — sem edição inline no card,
 * tudo acontece aqui dentro do dialog. */
@Component({
  selector: 'app-condicoes-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialGlobalModule, MaterialFormsModule],
  templateUrl: './condicoes-dialog.component.html',
  styleUrl: './condicoes-dialog.component.scss',
})
export class CondicoesDialogComponent {
  condicoes: RegraCondicaoUI[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CondicoesDialogData,
    private dialogRef: MatDialogRef<CondicoesDialogComponent, RegraCondicao[] | false>,
  ) {
    this.condicoes = structuredClone(data.condicoes);
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

    [this.condicoes[index], this.condicoes[alvo]] = [this.condicoes[alvo], this.condicoes[index]];
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

  get podeSalvar(): boolean {
    return this.condicoes.every((c) => c.padrao_regex.trim().length > 0);
  }

  confirmar(): void {
    if (!this.podeSalvar) return;

    this.dialogRef.close(
      this.condicoes.map((c) => ({ ordem: c.ordem, padrao_regex: c.padrao_regex })),
    );
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
