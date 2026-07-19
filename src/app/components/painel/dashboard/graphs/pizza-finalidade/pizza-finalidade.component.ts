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
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartEvent, ActiveElement } from 'chart.js';

import { MaterialGlobalModule } from '../../../../../shared/modules/material.imports.module';
import { DashboardService } from '../../../../../services/dashboard.service';
import { DashboardStateService } from '../../../../../services/dashboard-state.service';
import { DashboardFilterDto } from '../../../../../services/dto/dashboard-filter.dto';
import { DashboardPorFinalidade } from '../../../../../models/dashboard.model';
import { ListaLancamentosGraphComponent } from './lista-lancamentos-graph/lista-lancamentos-graph.component';

@Component({
  selector: 'app-pizza-finalidade',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule, BaseChartDirective, ListaLancamentosGraphComponent],
  templateUrl: './pizza-finalidade.component.html',
  styleUrl: './pizza-finalidade.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class PizzaFinalidadeComponent implements OnInit, OnChanges {
  @Input() filtros!: DashboardFilterDto;
  @Input() tipo!: string;

  finalidadeSelecionada: number | null = null;
  dados: DashboardPorFinalidade[] = [];
  dadosDisplay: DashboardPorFinalidade[] = [];
  loading = false;

  private readonly PALETTE = [
    '#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#26C6DA',
    '#EC407A', '#8D6E63', '#78909C', '#EF5350', '#D4E157',
    '#26A69A', '#FF7043', '#5C6BC0', '#9CCC65', '#FFA000',
  ];
  readonly chartType = 'pie' as const;
  chartData: ChartData<'pie'> = { labels: [], datasets: [{ data: [] }] };
  chartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          font: { size: 11 },
          padding: 10,
          generateLabels: (chart) => {
            const data = chart.data;
            if (!data.labels?.length || !data.datasets.length) return [];
            const values  = data.datasets[0].data as number[];
            const bgColors = data.datasets[0].backgroundColor as string[];
            const total   = values.reduce((s, v) => s + v, 0);
            return data.labels.map((label, i) => {
              const pct = total > 0 ? ((values[i] / total) * 100).toFixed(1) : '0.0';
              return {
                text:        `${label} (${pct}%)`,
                fillStyle:   bgColors[i],
                strokeStyle: bgColors[i],
                lineWidth:   0,
                hidden:      false,
                index:       i,
              };
            });
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value   = ctx.raw as number;
            const allData = ctx.dataset.data as number[];
            const total   = allData.reduce((s, v) => s + (v as number), 0);
            const pct     = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return ` R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${pct}%)`;
          },
        },
      },
    },
  };

  get tipoLabel(): string {
    return this.tipo === 'RECEITA' ? 'Receitas' : 'Despesas';
  }

  get selectedLabel(): string {
    return this.dadosDisplay.find(d => d.finalidade_id === this.finalidadeSelecionada)?.nome ?? '';
  }

  private dashboardService = inject(DashboardService);
  private stateService     = inject(DashboardStateService);
  private cdr              = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.finalidadeSelecionada = this.tipo === 'RECEITA'
      ? this.stateService.finalidadeIdReceita
      : this.stateService.finalidadeIdDespesa;
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filtros'] && !changes['filtros'].isFirstChange()) {
      this.finalidadeSelecionada = null;
      this.saveFinalidadeState();
      this.loadData();
    }
  }

  loadData(): void {
    if (!this.filtros) return;
    this.loading = true;
    const filter: DashboardFilterDto = { ...this.filtros, tipo: this.tipo };

    this.dashboardService.getPorFinalidade(filter).subscribe({
      next: (data) => {
        this.dados   = data;
        this.loading = false;
        this.buildChartData();
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private buildChartData(): void {
    if (this.dados.length > 6) {
      const top  = this.dados.slice(0, 5);
      const rest = this.dados.slice(5);
      this.dadosDisplay = [
        ...top,
        {
          finalidade_id: null,
          nome:          'RESTO',
          total_valor:   rest.reduce((s, d) => s + d.total_valor, 0),
          quantidade:    rest.reduce((s, d) => s + d.quantidade, 0),
        },
      ];
    } else {
      this.dadosDisplay = [...this.dados];
    }

    const colors = this.dadosDisplay.map((_, i) => this.PALETTE[i % this.PALETTE.length]);
    this.chartData = {
      labels: this.dadosDisplay.map(d => d.nome),
      datasets: [{
        data:                 this.dadosDisplay.map(d => d.total_valor),
        backgroundColor:      colors,
        hoverBackgroundColor: colors.map(c => c + 'cc'),
        borderWidth:          2,
        borderColor:          '#fff',
      }],
    };
  }

  onChartClick(event: { event?: ChartEvent; active?: object[] }): void {
    const active = event.active as ActiveElement[] | undefined;
    if (!active?.length) return;
    const index     = active[0].index;
    const clickedId = this.dadosDisplay[index]?.finalidade_id ?? null;
    this.finalidadeSelecionada = this.finalidadeSelecionada === clickedId ? null : clickedId;
    this.saveFinalidadeState();
    this.cdr.detectChanges();
  }

  clearSelection(): void {
    this.finalidadeSelecionada = null;
    this.saveFinalidadeState();
  }

  private saveFinalidadeState(): void {
    if (this.tipo === 'RECEITA') {
      this.stateService.finalidadeIdReceita = this.finalidadeSelecionada;
    } else {
      this.stateService.finalidadeIdDespesa = this.finalidadeSelecionada;
    }
  }
}
