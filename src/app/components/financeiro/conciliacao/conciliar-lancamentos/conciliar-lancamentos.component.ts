import { Component, OnInit, OnDestroy, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import {
  MaterialGlobalModule,
  MaterialFormsModule,
} from '../../../../shared/modules/material.imports.module';
import { ConciliacaoCardComponent } from './conciliacao-card/conciliacao-card.component';
import { AuditoriaResumoDialogComponent } from '../../shared/auditoria-resumo-dialog/auditoria-resumo-dialog.component';
import { ErrorHandlerService } from '../../../../shared/services/error-handler.service';
import { LancamentoService } from '../../../../services/lancamento.service';
import { FinalidadeService } from '../../../../services/finalidade.service';
import { DetalhamentoService } from '../../../../services/detalhamento.service';
import { Lancamento } from '../../../../models/lancamento.model';
import { Finalidade } from '../../../../models/finalidade.model';
import { StatusLancamento } from '../../../../models/constants/status-lancamento';
import { TipoLancamento } from '../../../../models/constants/tipo-lancamento';
import { FormaPagamento } from '../../../../models/constants/forma-pagamento';
import {
  MultiSelectComponent,
  MultiSelectItem,
} from '../../../../shared/components/multi-select/multi-select.component';

const ANIMATION_DURATION_MS = 350;
const LAZY_THRESHOLD = 10;
const PAGE_SIZE = 20;

interface CardItem extends Lancamento {
  _leaving: boolean;
}

@Component({
  selector: 'app-conciliar-lancamentos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialGlobalModule,
    MaterialFormsModule,
    MultiSelectComponent,
    ConciliacaoCardComponent,
  ],
  templateUrl: './conciliar-lancamentos.component.html',
  styleUrl: './conciliar-lancamentos.component.scss',
})
export class ConciliarLancamentosComponent implements OnInit, OnDestroy {
  private lancamentoService = inject(LancamentoService);
  private finalidadeService = inject(FinalidadeService);
  private detalhamentoService = inject(DetalhamentoService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);
  private errorHandler = inject(ErrorHandlerService);

  items: CardItem[] = [];
  finalidades: Finalidade[] = [];
  totalPendente = 0;
  loading = false;
  loadingMore = false;
  allLoaded = false;
  search = '';
  valorMin: number | null = null;
  valorMax: number | null = null;
  tipoFiltro = TipoLancamento.RECEITA;
  auditando = false;
  formasPagamento: MultiSelectItem[] = FormaPagamento.options.map((op) => ({
    id: op.value,
    label: op.name,
  }));
  formasPagamentoFiltro: string[] = [];

  readonly tipoOptions = TipoLancamento.options;

  private filtrosSubject = new Subject<void>();
  private filtrosSub!: Subscription;

  ngOnInit(): void {
    this.filtrosSub = this.filtrosSubject.pipe(debounceTime(500)).subscribe(() => this.reset());

    this.finalidadeService.listAll().subscribe({
      next: (data) => {
        this.finalidades = data;
        this.loadBatch(true);
      },
      error: () => this.loadBatch(true),
    });
  }

  ngOnDestroy(): void {
    this.filtrosSub?.unsubscribe();
  }

  onSearchChange(): void {
    this.filtrosSubject.next();
  }

  onValorChange(): void {
    this.filtrosSubject.next();
  }

  /** Campo vazio deve significar "sem filtro" — nunca 0. `[(ngModel)]` num
   * input number costuma virar `null` sozinho quando vazio, mas isso não é
   * garantido em todos os casos (ex: campo tocado e depois apagado deixa
   * `NaN` em vez de `null`), então normaliza explicitamente aqui. */
  private parseValorFiltro(valor: unknown): number | null {
    if (valor === '' || valor === null || valor === undefined) return null;
    const num = Number(valor);
    return Number.isFinite(num) ? num : null;
  }

  onTipoFiltroChange(): void {
    this.filtrosSubject.next();
  }

  onFormaPagamentoChange(formas: (string | number)[]): void {
    this.formasPagamentoFiltro = formas.map(String);
    this.filtrosSubject.next();
  }

  voltar(): void {
    this.router.navigate(['/lancamentos']);
  }

  processarConciliacao(): void {
    this.auditando = true;

    this.detalhamentoService.auditoria().subscribe({
      next: (resultado) => {
        this.dialog
          .open(AuditoriaResumoDialogComponent, {
            width: '480px',
            data: resultado,
          })
          .afterClosed()
          .subscribe(() => {
            this.auditando = false;
            this.cdr.detectChanges();
            this.reset();
          });
      },
      error: (err) => {
        this.auditando = false;
        this.cdr.detectChanges();
        this.errorHandler.handler(err);
      },
    });
  }

  private reset(): void {
    this.items = [];
    this.allLoaded = false;
    this.loadBatch(true);
  }

  loadBatch(initial = false, pageAppend = 20): void {
    if (initial) {
      this.loading = true;
    } else {
      this.loadingMore = true;
    }

    const excludeIds = this.items.map((i) => i.id);
    const valorMin = this.parseValorFiltro(this.valorMin);
    const valorMax = this.parseValorFiltro(this.valorMax);

    this.lancamentoService
      .list(
        {
          status: StatusLancamento.NAO_CONCILIADO,
          tipo: this.tipoFiltro,
          ...(this.formasPagamentoFiltro.length > 0 && {
            forma_pagamento: this.formasPagamentoFiltro,
          }),
          exclude_ids: excludeIds,
          ...(this.search ? { descricao: this.search } : {}),
          ...(valorMin !== null && { valor_min: valorMin }),
          ...(valorMax !== null && { valor_max: valorMax }),
        },
        { skip: 0, limit: pageAppend },
      )
      .subscribe({
        next: (page) => {
          const newItems: CardItem[] = page.items.map((l) => ({ ...l, _leaving: false }));
          if (excludeIds.length === 0) {
            this.totalPendente = page.total;
          }
          this.items = [...this.items, ...newItems];
          this.allLoaded = page.total < PAGE_SIZE;
          this.loading = false;
          this.loadingMore = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.loadingMore = false;
          this.cdr.detectChanges();
        },
      });
  }

  onConciliado(item: CardItem): void {
    item._leaving = true;
    this.totalPendente = Math.max(0, this.totalPendente - 1);
    this.cdr.detectChanges();

    setTimeout(() => {
      this.items = this.items.filter((i) => i.id !== item.id);

      if (this.visibleCount < LAZY_THRESHOLD && !this.allLoaded && !this.loadingMore) {
        this.loadBatch(false, 10);
      }
      this.cdr.detectChanges();
    }, ANIMATION_DURATION_MS);
  }

  get visibleCount(): number {
    return this.items.filter((i) => !i._leaving).length;
  }

  get isEmpty(): boolean {
    return !this.loading && this.items.length === 0;
  }
}
