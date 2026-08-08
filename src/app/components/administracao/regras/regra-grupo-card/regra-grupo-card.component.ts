import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { MaterialGlobalModule, MaterialFormsModule } from '../../../../shared/modules/material.imports.module';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { ErrorHandlerService } from '../../../../shared/services/error-handler.service';
import { RegraService } from '../../../../services/regra.service';
import { Regra, RegraCondicao, RegraGrupo } from '../../../../models/regra-grupo.model';
import { EscopoRegraGrupo } from '../../../../models/constants/escopo-regra-grupo';
import { RegraCardComponent } from './regra-card/regra-card.component';
import { RegraFormDialogComponent, RegraFormDialogData, RegraFormDialogResult } from '../regra-form-dialog/regra-form-dialog.component';
import { CondicoesDialogComponent, CondicoesDialogData } from '../condicoes-dialog/condicoes-dialog.component';

/** A "caixa" de um grupo de regras — expansível, custom (sem mat-accordion,
 * mesmo espírito do conciliacao-card.component.ts). Toda inclusão/edição de
 * Regra e Condição acontece em dialog; cada ação persiste imediatamente
 * (não há mais um "Salvar" em lote — o backend sempre substitui a árvore
 * inteira do grupo, então cada ação monta o array `regras` completo de novo). */
@Component({
  selector: 'app-regra-grupo-card',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialGlobalModule, MaterialFormsModule, RegraCardComponent],
  templateUrl: './regra-grupo-card.component.html',
  styleUrl: './regra-grupo-card.component.scss',
})
export class RegraGrupoCardComponent {
  @Input({ required: true }) grupo!: RegraGrupo;
  @Output() salvo = new EventEmitter<RegraGrupo>();

  private regraService = inject(RegraService);
  private dialog = inject(MatDialog);
  private toast = inject(ToastService);
  private errorHandler = inject(ErrorHandlerService);

  expandido = false;

  get escopoDescricao(): string {
    return EscopoRegraGrupo.getDescription(this.grupo.escopo);
  }

  get podeAtivarGrupo(): boolean {
    return this.grupo.regras.some((r) => r.ativo);
  }

  toggleExpandido(): void {
    this.expandido = !this.expandido;
  }

  onAtivoChange(ativo: boolean): void {
    this.regraService.editar(this.grupo.id, { ativo }).subscribe({
      next: (atualizado) => {
        this.toast.success({ message: `Grupo "${this.grupo.nome}" ${ativo ? 'ativado' : 'desativado'}.` });
        this.salvo.emit(atualizado);
      },
      error: (err) => this.errorHandler.handler(err),
    });
  }

  adicionarRegra(): void {
    this.dialog
      .open<RegraFormDialogComponent, RegraFormDialogData, RegraFormDialogResult | false>(RegraFormDialogComponent, {
        width: '480px',
        data: { modo: 'criar' },
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;

        const nova: Regra = { ...result, ordem: this.grupo.regras.length + 1, ativo: false, condicoes: [] };
        this.persistirRegras([...this.grupo.regras, nova]);
      });
  }

  editarRegra(index: number): void {
    const regra = this.grupo.regras[index];

    this.dialog
      .open<RegraFormDialogComponent, RegraFormDialogData, RegraFormDialogResult | false>(RegraFormDialogComponent, {
        width: '480px',
        data: { modo: 'editar', regra },
      })
      .afterClosed()
      .subscribe((result) => {
        if (!result) return;

        const novasRegras = this.grupo.regras.map((r, i) => (i === index ? { ...r, ...result } : r));
        this.persistirRegras(novasRegras);
      });
  }

  alternarAtivoRegra(index: number, ativo: boolean): void {
    const novasRegras = this.grupo.regras.map((r, i) => (i === index ? { ...r, ativo } : r));
    this.persistirRegras(novasRegras);
  }

  gerenciarCondicoes(index: number): void {
    const regra = this.grupo.regras[index];

    this.dialog
      .open<CondicoesDialogComponent, CondicoesDialogData, RegraCondicao[] | false>(CondicoesDialogComponent, {
        width: '760px',
        maxWidth: '95vw',
        data: { regraNome: regra.nome, condicoes: regra.condicoes },
      })
      .afterClosed()
      .subscribe((condicoes) => {
        if (!condicoes) return;

        const novasRegras = this.grupo.regras.map((r, i) => {
          if (i !== index) return r;
          // Sem nenhuma condição, a regra não pode continuar ativa (mesma
          // regra do backend, aplicada aqui pra refletir na hora).
          return { ...r, condicoes, ativo: condicoes.length === 0 ? false : r.ativo };
        });
        this.persistirRegras(novasRegras);
      });
  }

  excluirCondicao(regraIndex: number, condicaoIndex: number): void {
    const regra = this.grupo.regras[regraIndex];

    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        data: { title: 'Confirmar exclusão', message: `Remover esta condição da regra "${regra.nome}"?` },
      })
      .afterClosed()
      .subscribe((ok: boolean) => {
        if (!ok) return;

        const condicoes = regra.condicoes.filter((_, i) => i !== condicaoIndex);
        const novasRegras = this.grupo.regras.map((r, i) =>
          i === regraIndex ? { ...r, condicoes, ativo: condicoes.length === 0 ? false : r.ativo } : r,
        );
        this.persistirRegras(novasRegras);
      });
  }

  excluirRegra(index: number): void {
    const regra = this.grupo.regras[index];

    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        data: { title: 'Confirmar exclusão', message: `Deseja excluir a regra "${regra.nome}"?` },
      })
      .afterClosed()
      .subscribe((ok: boolean) => {
        if (!ok) return;

        const novasRegras = this.grupo.regras.filter((_, i) => i !== index);
        this.persistirRegras(novasRegras);
      });
  }

  subirRegra(index: number): void {
    this.moverRegra(index, -1);
  }

  descerRegra(index: number): void {
    this.moverRegra(index, 1);
  }

  private moverRegra(index: number, direcao: -1 | 1): void {
    const alvo = index + direcao;
    if (alvo < 0 || alvo >= this.grupo.regras.length) return;

    const novasRegras = [...this.grupo.regras];
    [novasRegras[index], novasRegras[alvo]] = [novasRegras[alvo], novasRegras[index]];
    novasRegras.forEach((r, i) => (r.ordem = i + 1));
    this.persistirRegras(novasRegras);
  }

  private persistirRegras(novasRegras: Regra[]): void {
    const payload = {
      regras: novasRegras.map((r) => ({
        nome: r.nome,
        ordem: r.ordem,
        ativo: r.ativo,
        tipo_detalhamento_resultado: r.tipo_detalhamento_resultado,
        modo_extracao: r.modo_extracao,
        condicoes: r.condicoes.map((c) => ({ ordem: c.ordem, padrao_regex: c.padrao_regex })),
      })),
    };

    this.regraService.editar(this.grupo.id, payload).subscribe({
      next: (atualizado) => {
        this.toast.success({ message: `Regras de "${this.grupo.nome}" atualizadas.` });
        this.salvo.emit(atualizado);
      },
      error: (err) => this.errorHandler.handler(err),
    });
  }
}
