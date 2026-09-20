import { ChangeDetectorRef, Component, Inject, Optional, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {
  MaterialGlobalModule,
  MaterialFormsModule,
} from '../../../modules/material.imports.module';
import { LancamentoService } from '../../../../services/lancamento.service';
import { Lancamento } from '../../../../models/lancamento.model';
import { TipoLancamento } from '../../../../models/constants/tipo-lancamento';
import { StatusLancamento } from '../../../../models/constants/status-lancamento';
import { FormaPagamento } from '../../../../models/constants/forma-pagamento';
import { PageTemplate } from '../../../../services/util/PageTemplate';
import { ListFilterBase } from '../../../../shared/classes/list-filter-base';

export interface LancamentoPickerReferencia {
  dataPagamento: string | null;
  titulo:        string;
  valor:         number;
  observacao:    string | null;
  restante:      number;
}

export interface LancamentoPickerDialogData {
  referencia?: LancamentoPickerReferencia;
}

@Component({
  selector: 'app-lancamento-picker-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialGlobalModule, MaterialFormsModule],
  templateUrl: './lancamento-picker-dialog.component.html',
  styleUrl: './lancamento-picker-dialog.component.scss',
})
export class LancamentoPickerDialogComponent extends ListFilterBase implements AfterViewInit {
  private lancamentoService = inject(LancamentoService);
  private cdr = inject(ChangeDetectorRef);
  private dialogRef = inject(MatDialogRef<LancamentoPickerDialogComponent, Lancamento>);

  result: PageTemplate<Lancamento> = new PageTemplate<Lancamento>();
  loading = false;
  search = '';
  statusFiltro = StatusLancamento.NAO_CONCILIADO;

  readonly statusOpcoes = StatusLancamento.optionsAll;
  readonly FormaPagamento = FormaPagamento;
  displayedColumns = ['data_pagamento', 'status', 'descricao', 'forma_pagamento', 'valor'];

  private searchSubject = new Subject<string>();

  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data: LancamentoPickerDialogData | null) {
    super();

    this.pageSize = 8;
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.pageIndex = 0;
      this.saveState({ search: this.search, statusFiltro: this.statusFiltro });
      this.load();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.load());
  }

  onSearchChange(): void {
    this.searchSubject.next(this.search);
  }

  onStatusChange(): void {
    this.pageIndex = 0;
    this.saveState({ search: this.search, statusFiltro: this.statusFiltro });
    this.load();
  }

  onPage(event: PageEvent): void {
    this.handlePage(
      event,
      () => ({ search: this.search, statusFiltro: this.statusFiltro }),
      () => this.load(),
    );
  }

  load(): void {
    this.loading = true;
    this.lancamentoService
      .list(
        {
          tipo: TipoLancamento.RECEITA,
          ...(this.search ? { descricao: this.search } : {}),
          ...(this.statusFiltro ? { status: this.statusFiltro } : {}),
        },
        {
          skip: this.pageIndex * this.pageSize,
          limit: this.pageSize,
          // O backend (app/utils/sort_utils.py) espera um único parâmetro
          // "sort" com os campos separados por vírgula -- por isso um único
          // elemento aqui, não um array com um item por campo (isso geraria
          // 3 parâmetros "sort" repetidos, dos quais o backend só lê um).
          sort: ['data_pagamento:desc,valor:desc,descricao:asc'],
        },
      )
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

  selecionar(lancamento: Lancamento): void {
    this.dialogRef.close(lancamento);
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  statusLabel(status: string): string {
    return status === 'CONCILIADO' ? 'Conciliado' : 'Não conciliado';
  }
}
