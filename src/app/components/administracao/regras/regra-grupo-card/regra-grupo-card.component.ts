import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaterialGlobalModule, MaterialFormsModule } from '../../../../shared/modules/material.imports.module';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { ErrorHandlerService } from '../../../../shared/services/error-handler.service';
import { RegraService } from '../../../../services/regra.service';
import { Regra, RegraGrupo } from '../../../../models/regra-grupo.model';
import { EscopoRegraGrupo } from '../../../../models/constants/escopo-regra-grupo';
import { TipoDetalhamento } from '../../../../models/constants/tipo-detalhamento';
import { RegraCardComponent } from './regra-card/regra-card.component';

/** A "caixa" de um grupo de regras — expansível, custom (sem mat-accordion,
 * mesmo espírito do conciliacao-card.component.ts). Edita localmente a lista
 * de Regra/RegraCondicao e só persiste tudo de uma vez no "Salvar" (o backend
 * sempre substitui a árvore inteira do grupo). */
@Component({
  selector: 'app-regra-grupo-card',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialGlobalModule, MaterialFormsModule, RegraCardComponent],
  templateUrl: './regra-grupo-card.component.html',
  styleUrl: './regra-grupo-card.component.scss',
})
export class RegraGrupoCardComponent implements OnChanges {
  @Input({ required: true }) grupo!: RegraGrupo;
  @Output() salvo = new EventEmitter<RegraGrupo>();

  private regraService = inject(RegraService);
  private toast = inject(ToastService);
  private errorHandler = inject(ErrorHandlerService);

  expandido = false;
  salvando = false;
  regras: Regra[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['grupo']) {
      // Cópia local — edições não afetam o objeto do pai até salvar.
      this.regras = structuredClone(this.grupo.regras);
    }
  }

  get escopoDescricao(): string {
    return EscopoRegraGrupo.getDescription(this.grupo.escopo);
  }

  toggleExpandido(): void {
    this.expandido = !this.expandido;
  }

  onAtivoChange(ativo: boolean): void {
    this.regraService.editar(this.grupo.id, { ativo }).subscribe({
      next: (atualizado) => {
        this.grupo.ativo = atualizado.ativo;
        this.toast.success({ message: `Grupo "${this.grupo.nome}" ${ativo ? 'ativado' : 'desativado'}.` });
      },
      error: (err) => {
        this.grupo.ativo = !ativo;
        this.errorHandler.handler(err);
      },
    });
  }

  adicionarRegra(): void {
    this.regras.push({
      nome: 'Nova regra',
      ordem: this.regras.length + 1,
      ativo: true,
      tipo_detalhamento_resultado: TipoDetalhamento.OUTRO,
      condicoes: [{ ordem: 1, padrao_regex: '' }],
    });
  }

  removerRegra(index: number): void {
    this.regras.splice(index, 1);
    this.reindexar();
  }

  subirRegra(index: number): void {
    this.moverRegra(index, -1);
  }

  descerRegra(index: number): void {
    this.moverRegra(index, 1);
  }

  private moverRegra(index: number, direcao: -1 | 1): void {
    const alvo = index + direcao;
    if (alvo < 0 || alvo >= this.regras.length) return;

    [this.regras[index], this.regras[alvo]] = [this.regras[alvo], this.regras[index]];
    this.reindexar();
  }

  private reindexar(): void {
    this.regras.forEach((r, i) => (r.ordem = i + 1));
  }

  salvar(): void {
    if (this.regras.some((r) => !r.nome.trim())) {
      this.toast.error({ message: 'Toda regra precisa de um nome.' });
      return;
    }
    if (this.regras.some((r) => r.condicoes.some((c) => !c.padrao_regex.trim()))) {
      this.toast.error({ message: 'Toda condição precisa de um padrão (regex) preenchido.' });
      return;
    }

    this.salvando = true;
    const payload = {
      regras: this.regras.map((r) => ({
        nome: r.nome,
        ordem: r.ordem,
        ativo: r.ativo,
        tipo_detalhamento_resultado: r.tipo_detalhamento_resultado,
        condicoes: r.condicoes.map((c) => ({ ordem: c.ordem, padrao_regex: c.padrao_regex })),
      })),
    };

    this.regraService.editar(this.grupo.id, payload).subscribe({
      next: (atualizado) => {
        this.salvando = false;
        this.toast.success({ message: `Regras de "${this.grupo.nome}" salvas com sucesso.` });
        this.salvo.emit(atualizado);
      },
      error: (err) => {
        this.salvando = false;
        this.errorHandler.handler(err);
      },
    });
  }
}
