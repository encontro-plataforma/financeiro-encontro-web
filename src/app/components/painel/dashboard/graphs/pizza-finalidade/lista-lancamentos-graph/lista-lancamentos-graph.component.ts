import {
  ChangeDetectorRef,
  Component,
  inject,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';

import { MaterialGlobalModule } from '../../../../../../shared/modules/material.imports.module';
import { LancamentoService }      from '../../../../../../services/lancamento.service';
import { DashboardStateService }  from '../../../../../../services/dashboard-state.service';
import { AuthService }            from '../../../../../../services/auth.service';
import { Lancamento } from '../../../../../../models/lancamento.model';
import { DashboardFilterDto } from '../../../../../../services/dto/dashboard-filter.dto';
import { LancamentoFilterDto } from '../../../../../../services/dto/lancamento-filter.dto';
import { FormaPagamento } from '../../../../../../models/constants/forma-pagamento';

@Component({
  selector: 'app-lista-lancamentos-graph',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule],
  templateUrl: './lista-lancamentos-graph.component.html',
  styleUrl: './lista-lancamentos-graph.component.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'lista-lancamentos-graph' },
})
export class ListaLancamentosGraphComponent implements OnInit, OnChanges {
  @Input() filtros!: DashboardFilterDto;
  @Input() tipo!: string;
  @Input() finalidadeId: number | null = null;

  lancamentos: Lancamento[] = [];
  total = 0;
  pageIndex = 0;
  loading = false;

  readonly PAGE_SIZE = 11;
  readonly columns = ['data', 'finalidade', 'descricao', 'forma_pagamento', 'valor'];

  private lancamentoService = inject(LancamentoService);
  private stateService      = inject(DashboardStateService);
  private router            = inject(Router);
  private cdr               = inject(ChangeDetectorRef);
  private authService       = inject(AuthService);

  ngOnInit(): void {
    this.pageIndex = this.tipo === 'RECEITA'
      ? this.stateService.pageIndexReceita
      : this.stateService.pageIndexDespesa;
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const filtrosChanged    = changes['filtros']      && !changes['filtros'].isFirstChange();
    const finalidadeChanged = changes['finalidadeId'] && !changes['finalidadeId'].isFirstChange();
    if (filtrosChanged || finalidadeChanged) {
      this.pageIndex = 0;
      this.savePageState();
      this.loadData();
    }
  }

  loadData(): void {
    if (!this.filtros) return;
    this.loading = true;
    const filter = this.buildFilter();
    const skip   = this.pageIndex * this.PAGE_SIZE;

    this.lancamentoService.list(filter, { skip, limit: this.PAGE_SIZE }).subscribe({
      next: (page) => {
        this.lancamentos = page.items;
        this.total       = page.total;
        this.loading     = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private buildFilter(): LancamentoFilterDto {
    // finalidade_ids: seleção do pizza tem prioridade; senão usa filtro geral do dashboard
    const finalidadeIds: number[] | undefined =
      this.finalidadeId !== null
        ? [this.finalidadeId]
        : this.filtros.finalidade_id?.length
          ? this.filtros.finalidade_id
          : undefined;

    return {
      tipo:                            this.tipo,
      ...(this.filtros.data_inicio  && { data_inicio:     this.filtros.data_inicio  }),
      ...(this.filtros.data_fim     && { data_fim:        this.filtros.data_fim     }),
      ...(this.filtros.status       && { status:          this.filtros.status       }),
      ...(this.filtros.forma_pagamento?.length && { forma_pagamento: this.filtros.forma_pagamento }),
      ...(finalidadeIds             && { finalidade_ids:  finalidadeIds             }),
    };
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.savePageState();
    this.loadData();
  }

  onRowClick(row: Lancamento): void {
    if (this.authService.getUsuario()?.perfil === 'REPORTER') return;
    this.router.navigate(['/lancamentos', row.id, 'editar'], {
      state: { returnUrl: this.router.url },
    });
  }

  private savePageState(): void {
    if (this.tipo === 'RECEITA') {
      this.stateService.pageIndexReceita = this.pageIndex;
    } else {
      this.stateService.pageIndexDespesa = this.pageIndex;
    }
  }

  getFormaPagamentoLabel(forma: string): string {
    switch (forma) {
      case FormaPagamento.PIX:            return 'PIX';
      case FormaPagamento.DINHEIRO:       return 'Dinheiro';
      case FormaPagamento.CARTAO_CREDITO: return 'Crédito';
      case FormaPagamento.CARTAO_DEBITO:  return 'Débito';
      default:                            return forma;
    }
  }

  getFormaPagamentoClass(forma: string): string {
    switch (forma) {
      case FormaPagamento.PIX:            return 'chip chip-pix';
      case FormaPagamento.DINHEIRO:       return 'chip chip-dinheiro';
      case FormaPagamento.CARTAO_CREDITO: return 'chip chip-credito';
      case FormaPagamento.CARTAO_DEBITO:  return 'chip chip-debito';
      default:                            return 'chip';
    }
  }

  getFinalidadeClass(): string {
    return this.tipo === 'RECEITA' ? 'chip chip-receita' : 'chip chip-despesa';
  }
}
