import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaterialGlobalModule, MaterialFormsModule } from '../../../../../shared/modules/material.imports.module';
import { CurrencyBRPipe } from '../../../../../shared/pipes/currency-br.pipe';
import { ToastService } from '../../../../../shared/components/toast/toast.service';
import { ErrorHandlerService } from '../../../../../shared/services/error-handler.service';
import { LancamentoService } from '../../../../../services/lancamento.service';
import { Lancamento } from '../../../../../models/lancamento.model';
import { Finalidade } from '../../../../../models/finalidade.model';
import { TipoLancamento } from '../../../../../models/constants/tipo-lancamento';
import { FormaPagamento } from '../../../../../models/constants/forma-pagamento';

@Component({
  selector: 'app-conciliacao-card',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialGlobalModule, MaterialFormsModule, CurrencyBRPipe],
  templateUrl: './conciliacao-card.component.html',
  styleUrl: './conciliacao-card.component.scss',
})
export class ConciliacaoCardComponent implements OnInit {
  @Input() lancamento!: Lancamento;
  @Input() finalidades: Finalidade[] = [];
  @Output() conciliado = new EventEmitter<void>();

  selectedFinalidadeId: number | null = null;
  observacaoConciliar = '';
  conciliando = false;

  readonly TipoLancamento  = TipoLancamento;
  readonly FormaPagamento  = FormaPagamento;

  constructor(
    private lancamentoService: LancamentoService,
    private toast: ToastService,
    private errorHandler: ErrorHandlerService,
  ) {}

  get finalidadesFiltradas(): Finalidade[] {
    return this.finalidades.filter(f => f.tipo === this.lancamento.tipo);
  }

  ngOnInit(): void {
    const filtered    = this.finalidadesFiltradas;
    const suggestionId = this.lancamento.sugestao_finalidade?.id ?? null;
    const isValid     = filtered.some(f => f.id === suggestionId);
    this.selectedFinalidadeId = isValid ? suggestionId : (filtered[0]?.id ?? null);
  }

  conciliar(): void {
    if (!this.selectedFinalidadeId) {
      this.toast.warning({ message: 'Selecione uma finalidade para conciliar.' });
      return;
    }

    this.conciliando = true;
    this.lancamentoService
      .conciliar(this.lancamento.id, this.selectedFinalidadeId, this.observacaoConciliar || undefined)
      .subscribe({
        next: () => {
          this.conciliando = false;
          this.conciliado.emit();
        },
        error: (err) => {
          this.conciliando = false;
          this.errorHandler.handler(err);
        },
      });
  }

  getTipoClass(): string {
    return this.lancamento.tipo === TipoLancamento.RECEITA ? 'chip-receita' : 'chip-despesa';
  }

  getFormaPagamentoLabel(): string {
    return FormaPagamento.options.find(f => f.value === this.lancamento.forma_pagamento)?.name
      ?? this.lancamento.forma_pagamento;
  }

  getDescricaoLabel(): string {
    if (this.lancamento.descricao.length > 35) {
      return this.lancamento.descricao.substring(0, 32) + '...';
    }

    return this.lancamento.descricao;
  }
}
