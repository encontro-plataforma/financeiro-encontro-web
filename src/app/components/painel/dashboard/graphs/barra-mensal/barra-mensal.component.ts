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
import { ChartConfiguration, ChartData } from 'chart.js';

import { MaterialGlobalModule } from '../../../../../shared/modules/material.imports.module';
import { DashboardService } from '../../../../../services/dashboard.service';
import { DashboardFilterDto } from '../../../../../services/dto/dashboard-filter.dto';
import { DashboardPorMes } from '../../../../../models/dashboard.model';

@Component({
  selector: 'app-barra-mensal',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule, BaseChartDirective],
  templateUrl: './barra-mensal.component.html',
  styleUrl: './barra-mensal.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class BarraMensalComponent implements OnInit, OnChanges {
  @Input() filtros!: DashboardFilterDto;

  loading = false;

  readonly chartType = 'bar' as const;
  chartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { label: 'Receitas', data: [], backgroundColor: 'rgba(76,175,80,0.8)',  borderColor: '#388e3c', borderWidth: 1 },
      { label: 'Despesas', data: [], backgroundColor: 'rgba(244,67,54,0.8)',  borderColor: '#c62828', borderWidth: 1 },
    ],
  };

  chartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            ` ${ctx.dataset.label}: R$ ${(ctx.raw as number).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false } },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (v) => `R$ ${(v as number).toLocaleString('pt-BR')}`,
        },
      },
    },
  };

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
    this.dashboardService.getPorMes(this.filtros).subscribe({
      next: (data) => {
        this.buildChartData(data);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private buildChartData(data: DashboardPorMes[]): void {
    const labels = data.map(d => this.formatMes(d.mes));
    this.chartData = {
      labels,
      datasets: [
        {
          label:           'Receitas',
          data:            data.map(d => d.total_receitas),
          backgroundColor: 'rgba(76,175,80,0.8)',
          borderColor:     '#388e3c',
          borderWidth:     1,
        },
        {
          label:           'Despesas',
          data:            data.map(d => d.total_despesas),
          backgroundColor: 'rgba(244,67,54,0.8)',
          borderColor:     '#c62828',
          borderWidth:     1,
        },
      ],
    };
  }

  private formatMes(mes: string): string {
    const [year, month] = mes.split('-');
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return `${months[parseInt(month, 10) - 1]}/${year.slice(2)}`;
  }
}
