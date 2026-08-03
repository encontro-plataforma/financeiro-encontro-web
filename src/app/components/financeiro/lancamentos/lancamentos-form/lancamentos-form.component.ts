import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';

import {
  MaterialGlobalModule,
  MaterialFormsModule,
  MaterialDatepickerModule,
} from '../../../../shared/modules/material.imports.module';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { LancamentoService } from '../../../../services/lancamento.service';
import { FinalidadeService } from '../../../../services/finalidade.service';
import { Lancamento } from '../../../../models/lancamento.model';
import { Finalidade } from '../../../../models/finalidade.model';
import { TipoLancamento } from '../../../../models/constants/tipo-lancamento';
import { StatusLancamento } from '../../../../models/constants/status-lancamento';
import { FormaPagamento } from '../../../../models/constants/forma-pagamento';
import { ErrorHandlerService } from '../../../../shared/services/error-handler.service';
import { LancamentoDetalhamentosComponent } from './lancamento-detalhamentos/lancamento-detalhamentos.component';

@Component({
  selector: 'app-lancamentos-form',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule, MaterialFormsModule, MaterialDatepickerModule, LancamentoDetalhamentosComponent],
  templateUrl: './lancamentos-form.component.html',
  styleUrl: './lancamentos-form.component.scss',
})
export class LancamentosFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private lancamentoService = inject(LancamentoService);
  private finalidadeService = inject(FinalidadeService);
  private toast = inject(ToastService);
  private errorHandler = inject(ErrorHandlerService);

  form!: FormGroup;
  saving = false;
  loading = false;
  updatePage = false;
  lancamentoId: number | null = null;
  lancamento: Lancamento | null = null;

  finalidades: Finalidade[]          = [];
  tipoOpcoes          = TipoLancamento.options;
  formaPagamentoOpcoes = FormaPagamento.options;

  get finalidadesFiltradas(): Finalidade[] {
    const tipo = this.form?.get('tipo')?.value;
    return tipo ? this.finalidades.filter(f => f.tipo === tipo) : this.finalidades;
  }

  readonly StatusLancamento = StatusLancamento;
  readonly TipoLancamento = TipoLancamento;

  get isConciliado(): boolean {
    return this.lancamento?.status === StatusLancamento.CONCILIADO;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      descricao: ['', Validators.required],
      valor: [null, [Validators.required, Validators.min(0.01)]],
      tipo: [TipoLancamento.RECEITA, Validators.required],
      forma_pagamento: [FormaPagamento.PIX, Validators.required],
      data_pagamento: [moment(), Validators.required],
      finalidade_id: [null, Validators.required],
      observacao: [''],
    });

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.updatePage = true;
      this.lancamentoId = Number(id);
      this.loadValues(this.lancamentoId);
    }

    this.bindSeervices();
  }

  private bindSeervices(): void {
    this.finalidadeService.listAll().subscribe({
      next: (data) => {
        this.finalidades = data;
        this.syncFinalidadeByTipo();
      },
    });

    this.form.get('tipo')?.valueChanges.subscribe(() => {
      this.syncFinalidadeByTipo();
    });
  }

  private syncFinalidadeByTipo(): void {
    const filtered   = this.finalidadesFiltradas;
    const currentId  = this.form.get('finalidade_id')?.value;
    const isStillValid = filtered.some(f => f.id === currentId);
    if (!isStillValid) {
      this.form.get('finalidade_id')?.setValue(filtered[0]?.id ?? null);
    }
  }

  private loadValues(id: number): void {
    this.loading = true;
    this.lancamentoService.buscarPorId(id).subscribe({
      next: (data) => {
        this.lancamento = data;
        this.form.patchValue({
          descricao: data.descricao,
          valor: data.valor,
          tipo: data.tipo,
          forma_pagamento: data.forma_pagamento,
          data_pagamento: moment(data.data_pagamento),
          finalidade_id: data.finalidade_id,
          observacao: data.observacao,
        });
        this.syncFormEnabledState();
        this.loading = false;
      },
      error: (err) => {
        this.errorHandler.handler(err);
        this.loading = false;
        this.voltar();
      },
    });
  }

  private syncFormEnabledState(): void {
    if (this.isConciliado) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  onDetalhamentosAlterado(): void {
    if (!this.lancamentoId) return;

    this.lancamentoService.buscarPorId(this.lancamentoId).subscribe({
      next: (data) => {
        this.lancamento = data;
        this.syncFormEnabledState();
      },
    });
  }

  conciliar(): void {
    if (!this.lancamentoId) return;
    const { finalidade_id, observacao } = this.form.value;
    if (!finalidade_id) {
      this.toast.warning({ message: 'Selecione uma finalidade antes de conciliar.' });
      return;
    }

    this.lancamentoService.editar(this.lancamentoId, {
      finalidade_id,
      status: StatusLancamento.CONCILIADO,
      ...(observacao ? { observacao } : {}),
    }).subscribe({
      next: (data) => {
        this.lancamento = data;
        this.syncFormEnabledState();
        this.toast.success({ message: 'Lançamento conciliado com sucesso.' });
      },
      error: (err) => this.errorHandler.handler(err),
    });
  }

  desconciliar(): void {
    if (!this.lancamentoId) return;
    this.lancamentoService
      .editar(this.lancamentoId, { status: StatusLancamento.NAO_CONCILIADO })
      .subscribe({
        next: (data) => {
          this.lancamento = data;
          this.syncFormEnabledState();
          this.toast.success({ message: 'Lançamento desconciliado.' });
        },
        error: (err) => this.errorHandler.handler(err),
      });
  }

  voltar(): void {
    const returnUrl: string | undefined = window.history.state?.returnUrl;
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(['/lancamentos']);
    }
  }

  private buildPayload() {
    const { data_pagamento, ...rest } = this.form.value;
    return { ...rest, data_pagamento: moment(data_pagamento).format('YYYY-MM-DDT00:00:00') };
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning({ message: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    const payload = this.buildPayload();

    if (payload.tipo === TipoLancamento.RECEITA) {
      const soma = this.lancamento?.soma_detalhamentos ?? 0;
      if (payload.valor < soma) {
        this.toast.warning({
          message: `O valor não pode ser menor que a soma dos detalhamentos já vinculados (R$ ${soma.toFixed(2)}).`,
        });
        return;
      }
    }

    this.saving = true;

    const req$ =
      this.updatePage && this.lancamentoId
        ? this.lancamentoService.editar(this.lancamentoId, payload)
        : this.lancamentoService.criar(payload);

    const msg = this.updatePage
      ? 'Lançamento atualizado com sucesso.'
      : 'Lançamento criado com sucesso.';

    req$.subscribe({
      next: () => {
        this.toast.success({ message: msg });
        this.saving = false;
        this.voltar();
      },
      error: (err) => {
        this.errorHandler.handler(err);
        this.saving = false;
      },
    });
  }
}
