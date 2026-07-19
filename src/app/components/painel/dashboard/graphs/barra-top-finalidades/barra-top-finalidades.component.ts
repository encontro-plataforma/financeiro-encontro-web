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
import { forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

import { MaterialGlobalModule } from '../../../../../shared/modules/material.imports.module';
import { DashboardService } from '../../../../../services/dashboard.service';
import { DashboardFilterDto } from '../../../../../services/dto/dashboard-filter.dto';
import { DashboardPorFinalidade } from '../../../../../models/dashboard.model';

@Component({
  selector: 'app-barra-top-finalidades',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule, BaseChartDirective],
  templateUrl: './barra-top-finalidades.component.html',
  styleUrl: './barra-top-finalidades.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class BarraTopFinalidadesComponent implements OnInit, OnChanges {
  @Input() filtros!: DashboardFilterDto;

  loading = false;

  receitaData: ChartData<'bar'> = { labels: [], datasets: [] };
  despesaData: ChartData<'bar'> = { labels: [], datasets: [] };

  readonly chartType = 'bar' as const;

  readonly receitaOptions: ChartConfiguration<'bar'>['options'] = this.buildOptions();
  readonly despesaOptions: ChartConfiguration<'bar'>['options'] = this.buildOptions();

  private dashboardService = inject(DashboardService);
  private cdr              = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filtros'] && !changes['filtros'].isFirstChange()) {
      this.loadData();
    }
  }

  loadData(): void {
    if (!this.filtros) return;
    this.loading = true;

    forkJoin({
      receita: this.dashboardService.getPorFinalidade({ ...this.filtros, tipo: 'RECEITA' }),
      despesa: this.dashboardService.getPorFinalidade({ ...this.filtros, tipo: 'DESPESA' }),
    }).subscribe({
      next: ({ receita, despesa }) => {
        this.receitaData = this.buildChartData(receita.slice(0, 5), 'rgba(76,175,80,0.8)');
        this.despesaData = this.buildChartData(despesa.slice(0, 5), 'rgba(244,67,54,0.8)');
        this.loading     = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private buildChartData(data: DashboardPorFinalidade[], color: string): ChartData<'bar'> {
    return {
      labels: data.map(d => d.nome),
      datasets: [{
        data:            data.map(d => d.total_valor),
        backgroundColor: color,
        borderWidth:     0,
      }],
    };
  }

  private buildOptions(): ChartConfiguration<'bar'>['options'] {
    return {
      indexAxis: 'y' as const,
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ` R$ ${(ctx.raw as number).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
          },
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            callback: (v) => `R$ ${(v as number).toLocaleString('pt-BR')}`,
            font: { size: 10 },
          },
          grid: { display: false },
        },
        y: {
          ticks: { font: { size: 11 } },
        },
      },
    };
  }
}
