import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import moment from 'moment';

import {
  MaterialGlobalModule,
  MaterialFormsModule,
  MaterialDatepickerModule,
} from '../../../shared/modules/material.imports.module';
import {
  MultiSelectComponent,
  MultiSelectItem,
} from '../../../shared/components/multi-select/multi-select.component';
import { DashboardService } from '../../../services/dashboard.service';
import { FinalidadeService } from '../../../services/finalidade.service';
import { DashboardStateService } from '../../../services/dashboard-state.service';
import { DashboardTotais } from '../../../models/dashboard.model';
import { Finalidade } from '../../../models/finalidade.model';
import { DashboardFilterDto } from '../../../services/dto/dashboard-filter.dto';
import { TipoLancamento } from '../../../models/constants/tipo-lancamento';
import { StatusLancamento } from '../../../models/constants/status-lancamento';
import { FormaPagamento } from '../../../models/constants/forma-pagamento';
import { PizzaFinalidadeComponent } from './graphs/pizza-finalidade/pizza-finalidade.component';
import { BarraMensalComponent } from './graphs/barra-mensal/barra-mensal.component';
import { BarraTopFinalidadesComponent } from './graphs/barra-top-finalidades/barra-top-finalidades.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    MaterialGlobalModule,
    MaterialFormsModule,
    MaterialDatepickerModule,
    MultiSelectComponent,
    PizzaFinalidadeComponent,
    BarraMensalComponent,
    BarraTopFinalidadesComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  formFilters: FormGroup;
  totais: DashboardTotais | null = null;
  loading = false;

  filtrosAtivos: DashboardFilterDto = {
    data_inicio: moment().startOf('year').format('YYYY-MM-DDT00:00:00'),
    data_fim: moment().format('YYYY-MM-DDT23:59:59'),
  };

  private cdr = inject(ChangeDetectorRef);

  tipoOpcoes = TipoLancamento.optionsAll;
  statusOpcoes = StatusLancamento.optionsAll;
  formasPagamento: MultiSelectItem[] = [];
  finalidades: MultiSelectItem[] = [];

  constructor(
    private fb: FormBuilder,
    private dashboardService: DashboardService,
    private finalidadeService: FinalidadeService,
    private stateService: DashboardStateService,
  ) {
    this.formFilters = this.fb.group({
      data_inicio: [moment().startOf('year')],
      data_fim: [moment()],
      tipo: [TipoLancamento.TODOS],
      status: [StatusLancamento.TODOS],
      forma_pagamento: [[]],
      finalidade_id: [[]],
    });

    this.buildFormasPagamento();
  }

  ngOnInit(): void {
    this.loadFinalidades();
  }

  private buildFormasPagamento(): void {
    this.formasPagamento = FormaPagamento.options.map((op) => ({
      id: op.value,
      label: op.name,
    }));
  }

  private loadFinalidades(): void {
    this.finalidadeService.listAll().subscribe({
      next: (data: Finalidade[]) => {
        this.finalidades = data.map((f) => ({
          id: f.id,
          label: f.nome + (f.tipo === TipoLancamento.RECEITA ? ' (Receita)' : ' (Despesa)'),
        }));
        this.initializeDashboard();
      },
      error: () => this.initializeDashboard(),
    });
  }

  private initializeDashboard(): void {
    const saved = this.stateService.filtrosAtivos;
    if (saved) {
      this.filtrosAtivos = saved;
      this.loadTotais(saved);
    } else {
      this.buscar();
    }
  }

  private loadTotais(filter: DashboardFilterDto): void {
    this.loading = true;
    this.dashboardService.getTotais(filter).subscribe({
      next: (data) => {
        this.totais = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  buscar(): void {
    const filter = this.buildFilter();
    this.filtrosAtivos = filter;
    this.stateService.filtrosAtivos = filter;
    this.loading = true;

    this.dashboardService.getTotais(filter).subscribe({
      next: (data) => {
        this.totais = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private buildFilter(): DashboardFilterDto {
    const { data_inicio, data_fim, tipo, status, forma_pagamento, finalidade_id } =
      this.formFilters.value;
    return {
      ...(data_inicio && { data_inicio: moment(data_inicio).format('YYYY-MM-DDT00:00:00') }),
      ...(data_fim && { data_fim: moment(data_fim).format('YYYY-MM-DDT23:59:59') }),
      ...(tipo && { tipo }),
      ...(status && { status }),
      ...(forma_pagamento?.length > 0 && { forma_pagamento }),
      ...(finalidade_id?.length > 0 && { finalidade_id }),
    };
  }
}
