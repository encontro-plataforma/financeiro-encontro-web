import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { MaterialGlobalModule } from '../../modules/material.imports.module';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import {
  LancamentoPickerDialogComponent,
  LancamentoPickerDialogData,
} from './lancamento-picker-dialog/lancamento-picker-dialog.component';
import { ValorDetalhamentoDialogComponent } from '../valor-detalhamento-dialog/valor-detalhamento-dialog.component';
import { ToastService } from '../toast/toast.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { DetalhamentoService } from '../../../services/detalhamento.service';
import { Detalhamento } from '../../../models/detalhamento.model';
import { Lancamento } from '../../../models/lancamento.model';
import { FormaPagamento } from '../../../models/constants/forma-pagamento';

const TOLERANCIA = 0.01;

@Component({
  selector: 'app-vinculo-lancamento',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule],
  templateUrl: './vinculo-lancamento.component.html',
  styleUrl: './vinculo-lancamento.component.scss',
})
export class VinculoLancamentoComponent implements OnInit, OnChanges {
  /** 'INSCRICAO_ENCONTREIRO' | 'INSCRICAO_ENCONTRISTA' */
  @Input() tipo!: string;
  @Input() referenciaId!: number;
  @Input() valorPagamento: number | null = null;
  /** Usados só pro resumo mostrado no picker de lançamento. */
  @Input() nomePessoa: string | null = null;
  @Input() dataPagamento: string | null = null;
  @Input() observacaoPessoa: string | null = null;

  readonly FormaPagamento = FormaPagamento;

  /** Emitido após ligar/remover com sucesso — o pai deve recarregar o registro (badge de auditado, etc). */
  @Output() vinculado = new EventEmitter<void>();

  private dialog              = inject(MatDialog);
  private router               = inject(Router);
  private detalhamentoService = inject(DetalhamentoService);
  private toast                = inject(ToastService);
  private errorHandler         = inject(ErrorHandlerService);
  private cdr                  = inject(ChangeDetectorRef);

  detalhamentos: Detalhamento[] = [];
  carregando  = false;
  processando = false;

  ngOnInit(): void {
    this.carregarVinculos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['referenciaId'] && !changes['referenciaId'].firstChange) {
      this.carregarVinculos();
    }
  }

  get somaVinculada(): number {
    return this.detalhamentos.reduce((acc, det) => acc + (det.valor ?? 0), 0);
  }

  get restanteVincular(): number {
    return (this.valorPagamento ?? 0) - this.somaVinculada;
  }

  get podeVincularMais(): boolean {
    return !!this.valorPagamento && this.restanteVincular > TOLERANCIA;
  }

  formaPagamentoLabel(lancamento: Lancamento): string {
    return FormaPagamento.getDescriptionComParcelas(lancamento.forma_pagamento, lancamento.cart_parcelas);
  }

  private carregarVinculos(): void {
    if (!this.tipo || !this.referenciaId) return;

    this.carregando = true;
    this.detalhamentoService
      .listAll({ referencia_id: this.referenciaId, tipo: this.tipo })
      .subscribe({
        next: (data) => {
          this.detalhamentos = data;
          this.carregando = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.carregando = false;
          this.cdr.detectChanges();
        },
      });
  }

  verLancamento(det: Detalhamento): void {
    if (!det.lancamento) return;

    this.router.navigate(['/lancamentos', det.lancamento.id, 'editar'], {
      state: { returnUrl: this.router.url },
    });
  }

  ligar(): void {
    if (!this.valorPagamento) {
      this.toast.warning({ message: 'Esta inscrição não tem valor de pagamento definido.' });
      return;
    }

    const restanteInscricao = this.restanteVincular;
    if (restanteInscricao <= TOLERANCIA) {
      this.toast.warning({ message: 'Esta inscrição já está totalmente vinculada.' });
      return;
    }

    this.abrirPicker(restanteInscricao, (lancamento) => {
      const restanteLancamento = lancamento.valor - lancamento.soma_detalhamentos;
      const valorMaximo = Math.min(restanteInscricao, restanteLancamento);

      if (valorMaximo <= 0) {
        this.toast.warning({ message: 'Este lançamento não tem valor disponível para vincular.' });
        return;
      }

      this.abrirDialogValor(valorMaximo, valorMaximo, (valor) => {
        this.processando = true;
        this.detalhamentoService.criar({
          lancamento_id: lancamento.id,
          tipo: this.tipo,
          referencia_id: this.referenciaId,
          valor,
        }).subscribe({
          next: () => {
            this.processando = false;
            this.toast.success({ message: 'Lançamento vinculado com sucesso.' });
            this.carregarVinculos();
            this.vinculado.emit();
            this.cdr.detectChanges();
          },
          error: (err) => {
            this.processando = false;
            this.errorHandler.handler(err);
            this.cdr.detectChanges();
          },
        });
      });
    });
  }

  remover(det: Detalhamento): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title:   'Remover vínculo',
        message: 'Deseja remover o vínculo com este lançamento? A inscrição volta a ficar pendente de auditoria.',
      },
    }).afterClosed().subscribe((ok: boolean) => {
      if (!ok) return;

      this.processando = true;
      this.detalhamentoService.remover(det.id).subscribe({
        next: () => {
          this.processando = false;
          this.toast.success({ message: 'Vínculo removido.' });
          this.carregarVinculos();
          this.vinculado.emit();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.processando = false;
          this.errorHandler.handler(err);
          this.cdr.detectChanges();
        },
      });
    });
  }

  private abrirPicker(restanteInscricao: number, onSelecionado: (lancamento: Lancamento) => void): void {
    const data: LancamentoPickerDialogData = {
      referencia: {
        dataPagamento: this.dataPagamento,
        titulo:        this.nomePessoa ?? '',
        valor:         this.valorPagamento ?? 0,
        observacao:    this.observacaoPessoa,
        restante:      restanteInscricao,
      },
    };

    this.dialog.open<LancamentoPickerDialogComponent, LancamentoPickerDialogData, Lancamento>(
      LancamentoPickerDialogComponent,
      { width: '700px', maxWidth: '95vw', data },
    ).afterClosed().subscribe((lancamento) => {
      if (lancamento) onSelecionado(lancamento);
    });
  }

  private abrirDialogValor(
    valorSugerido: number,
    valorMaximo: number,
    onConfirmado: (valor: number) => void,
  ): void {
    this.dialog.open<ValorDetalhamentoDialogComponent, unknown, number>(ValorDetalhamentoDialogComponent, {
      width: '420px',
      data: { titulo: 'Valor a vincular', valorSugerido, valorMaximo },
    }).afterClosed().subscribe((valor) => {
      if (valor !== undefined && valor !== null) onConfirmado(valor);
    });
  }
}
