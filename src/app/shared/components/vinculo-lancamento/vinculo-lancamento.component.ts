import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { MaterialGlobalModule } from '../../modules/material.imports.module';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { LancamentoPickerDialogComponent } from './lancamento-picker-dialog/lancamento-picker-dialog.component';
import { ValorDetalhamentoDialogComponent } from '../valor-detalhamento-dialog/valor-detalhamento-dialog.component';
import { ToastService } from '../toast/toast.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { DetalhamentoService } from '../../../services/detalhamento.service';
import { Lancamento } from '../../../models/lancamento.model';
import { DetalhamentoVinculoResumo } from '../../../models/detalhamento.model';
import { FormaPagamento } from '../../../models/constants/forma-pagamento';
import { calcularSaldoPendente, calcularValorMaximoVinculo, podeAdicionarVinculo } from './vinculo.utils';

@Component({
  selector: 'app-vinculo-lancamento',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule],
  templateUrl: './vinculo-lancamento.component.html',
  styleUrl: './vinculo-lancamento.component.scss',
})
export class VinculoLancamentoComponent {
  /** 'INSCRICAO_ENCONTREIRO' | 'INSCRICAO_ENCONTRISTA' */
  @Input() tipo!: string;
  @Input() referenciaId!: number;
  @Input() valorPagamento: number | null = null;
  @Input() vinculos: DetalhamentoVinculoResumo[] = [];

  readonly FormaPagamento = FormaPagamento;

  /** Emitido após ligar/trocar/remover com sucesso — o pai deve recarregar o registro. */
  @Output() vinculado = new EventEmitter<void>();

  private dialog              = inject(MatDialog);
  private router               = inject(Router);
  private detalhamentoService = inject(DetalhamentoService);
  private toast                = inject(ToastService);
  private errorHandler         = inject(ErrorHandlerService);

  processando = false;

  get totalVinculado(): number {
    // Detalhamento.valor vem do backend como Decimal -- chega serializado
    // como string JSON ("60.00"), não como number; Number() evita que o "+"
    // vire concatenação de string em vez de soma.
    return this.vinculos.reduce((soma, v) => soma + Number(v.valor), 0);
  }

  get saldoPendente(): number | null {
    return calcularSaldoPendente(this.valorPagamento, this.totalVinculado);
  }

  get podeAdicionar(): boolean {
    return podeAdicionarVinculo(this.saldoPendente);
  }

  verLancamento(vinculo: DetalhamentoVinculoResumo): void {
    this.router.navigate(['/lancamentos', vinculo.lancamento.id, 'editar'], {
      state: { returnUrl: this.router.url },
    });
  }

  ligar(): void {
    if (!this.valorPagamento) {
      this.toast.warning({ message: 'Esta inscrição não tem valor de pagamento definido.' });
      return;
    }

    const saldoPessoa = this.saldoPendente ?? this.valorPagamento;

    this.abrirPicker((lancamento) => {
      const restanteLancamento = lancamento.valor - lancamento.soma_detalhamentos;
      const tetoEfetivo = calcularValorMaximoVinculo(restanteLancamento, saldoPessoa);
      this.abrirDialogValor(
        Math.min(saldoPessoa, tetoEfetivo > 0 ? tetoEfetivo : saldoPessoa),
        tetoEfetivo,
        (valor) => {
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
              this.vinculado.emit();
            },
            error: (err) => {
              this.processando = false;
              this.errorHandler.handler(err);
            },
          });
        },
      );
    });
  }

  trocar(vinculo: DetalhamentoVinculoResumo): void {
    this.abrirPicker((lancamento) => {
      this.processando = true;
      this.detalhamentoService.editar(vinculo.id, { lancamento_id: lancamento.id }).subscribe({
        next: () => {
          this.processando = false;
          this.toast.success({ message: 'Lançamento alterado com sucesso.' });
          this.vinculado.emit();
        },
        error: (err) => {
          this.processando = false;
          this.errorHandler.handler(err);
        },
      });
    });
  }

  remover(vinculo: DetalhamentoVinculoResumo): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title:   'Remover vínculo',
        message: 'Deseja remover o vínculo com este lançamento? O valor volta a ficar pendente.',
      },
    }).afterClosed().subscribe((ok: boolean) => {
      if (!ok) return;

      this.processando = true;
      this.detalhamentoService.remover(vinculo.id).subscribe({
        next: () => {
          this.processando = false;
          this.toast.success({ message: 'Vínculo removido.' });
          this.vinculado.emit();
        },
        error: (err) => {
          this.processando = false;
          this.errorHandler.handler(err);
        },
      });
    });
  }

  private abrirPicker(onSelecionado: (lancamento: Lancamento) => void): void {
    this.dialog.open<LancamentoPickerDialogComponent, unknown, Lancamento>(LancamentoPickerDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
    }).afterClosed().subscribe((lancamento) => {
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
