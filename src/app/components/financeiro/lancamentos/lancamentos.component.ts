import {
  Component,
  inject,
  OnInit,
  AfterViewInit,
  ChangeDetectorRef,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { CurrencyBRPipe } from '../../../shared/pipes/currency-br.pipe';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import moment from 'moment';

import {
  MaterialGlobalModule,
  MaterialFormsModule,
  MaterialDatepickerModule,
} from '../../../shared/modules/material.imports.module';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { CsvUploadDialogComponent } from '../../../shared/components/csv-upload-dialog/csv-upload-dialog.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { LancamentoService } from '../../../services/lancamento.service';
import { FinalidadeService } from '../../../services/finalidade.service';
import { ListFilterBase } from '../../../shared/classes/list-filter-base';
import { Lancamento } from '../../../models/lancamento.model';
import { Finalidade } from '../../../models/finalidade.model';
import { PageTemplate } from '../../../services/util/PageTemplate';
import { TipoLancamento } from '../../../models/constants/tipo-lancamento';
import { StatusLancamento } from '../../../models/constants/status-lancamento';
import { FormaPagamento } from '../../../models/constants/forma-pagamento';

@Component({
  selector: 'app-lancamentos',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    CurrencyBRPipe,
    DatePipe,
    MaterialGlobalModule,
    MaterialFormsModule,
    MaterialDatepickerModule,
  ],
  templateUrl: './lancamentos.component.html',
  styleUrl: './lancamentos.component.scss',
})
export class LancamentosComponent extends ListFilterBase implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  private toast = inject(ToastService);
  private lancamentoService = inject(LancamentoService);
  private finalidadeService = inject(FinalidadeService);

  formFilters!: FormGroup;
  result: PageTemplate<Lancamento> = new PageTemplate<Lancamento>();
  loading = false;
  pageIndex = 0;
  pageSize = 10;

  private loadSub?: Subscription;

  finalidades: Finalidade[] = [];
  tipoOpcoes = TipoLancamento.optionsAll;
  statusOpcoes = StatusLancamento.optionsAll;

  readonly TipoLancamento = TipoLancamento;
  readonly StatusLancamento = StatusLancamento;
  readonly FormaPagamento = FormaPagamento;

  displayedColumns = [
    'data_pagamento',
    'status',
    'descricao',
    'finalidade',
    'forma_pagamento',
    'valor',
    'acoes',
  ];

  ngOnInit(): void {
    this.formFilters = this.fb.group({
      data_inicio: [moment().startOf('month')],
      data_fim: [moment()],
      tipo: [TipoLancamento.TODOS],
      status: [StatusLancamento.TODOS],
      finalidade_id: [-1],
      descricao: [''],
    });

    // init filter state and restore into form
    this.initFilter('lancamentos', (saved) => {
      const patch: any = { ...saved.form };
      if (patch.data_inicio) patch.data_inicio = moment(patch.data_inicio);
      if (patch.data_fim) patch.data_fim = moment(patch.data_fim);
      this.formFilters.patchValue(patch, { emitEvent: false });
    });

    this.formFilters.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.saveState({ form: this.formFilters.value });
      this.buscar();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.finalidadeService.listAll().subscribe({
        next: (data) => {
          this.finalidades = data;
          this.buscar();
        },
        error: () => this.buscar(),
      });
    });
  }

  buscar(): void {
    this.pageIndex = 0;
    this.load();
  }

  load(): void {
    this.loading = true;
    const filters = this.buildFilter();

    // Cancela a requisição anterior ainda em andamento — sem isso, uma resposta
    // atrasada de uma busca antiga (ex: filtro "J") pode sobrescrever o resultado
    // de uma busca mais recente (ex: filtro "Jo") que respondeu mais rápido.
    this.loadSub?.unsubscribe();
    this.loadSub = this.lancamentoService
      .list(filters, { skip: this.pageIndex * this.pageSize, limit: this.pageSize })
      .subscribe({
        next: (data) => {
          this.result = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  onPage(event: PageEvent): void {
    this.handlePage(
      event,
      () => ({ form: this.formFilters.value }),
      () => this.load(),
    );
  }

  criar(): void {
    this.router.navigate(['/lancamentos/novo']);
  }
  editar(id: number): void {
    this.router.navigate(['/lancamentos', id, 'editar']);
  }

  enviarCsv(): void {
    CsvUploadDialogComponent.open(this.dialog, {
      titulo: 'Importar Extrato Bancário',
      endpoint: '/conciliacao/upload',
    })
      .afterClosed()
      .subscribe(() => this.load());
  }

  deletar(l: Lancamento): void {
    const valor = l.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        data: {
          title: 'Confirmar exclusão',
          message: `Deseja deletar o lançamento de ${TipoLancamento.getDescription(l.tipo)} "${l.descricao}" no valor de R$ ${valor}?`,
        },
      })
      .afterClosed()
      .subscribe((ok: boolean) => {
        if (!ok) return;
        this.lancamentoService.remover(l.id).subscribe({
          next: () => {
            this.toast.success({ message: 'Lançamento excluído com sucesso.' });
            this.load();
          },
          error: (err) =>
            this.toast.error({ message: err?.error?.detail ?? 'Erro ao excluir lançamento.' }),
        });
      });
  }

  getFinalidade(lanc: Lancamento): string {
    const finalidade = this.finalidades.find((f) => f.id === lanc.finalidade_id);
    if (finalidade) return finalidade.nome;

    return '-';
  }

  private buildFilter() {
    const { data_inicio, data_fim, tipo, status, finalidade_id, descricao } =
      this.formFilters.value;
    return {
      ...(data_inicio && { data_inicio: moment(data_inicio).format('YYYY-MM-DDT00:00:00') }),
      ...(data_fim && { data_fim: moment(data_fim).format('YYYY-MM-DDT23:59:59') }),
      ...(tipo && { tipo }),
      ...(status && { status }),
      ...(finalidade_id !== -1 && { finalidade_id: Number(finalidade_id) }),
      ...(descricao?.trim() && { descricao: descricao.trim() }),
    };
  }
}
