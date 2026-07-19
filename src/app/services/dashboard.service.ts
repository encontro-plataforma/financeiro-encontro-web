import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AbstractService } from './abstract.service';
import { DashboardTotais, DashboardPorDia, DashboardPorMes, DashboardPorFinalidade } from '../models/dashboard.model';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';

@Injectable({ providedIn: 'root' })
export class DashboardService extends AbstractService<DashboardTotais> {

  constructor(http: HttpClient) {
    super(http, 'dashboard');
  }

  getTotais(request: DashboardFilterDto): Observable<DashboardTotais> {
    const params = Object.assign({}, request);
    return this.getCustom<DashboardTotais>('/totais', { params });
  }

  getPorDia(request: DashboardFilterDto): Observable<DashboardPorDia[]> {
    const params = Object.assign({}, request);
    return this.getCustom<DashboardPorDia[]>('/por-dia', { params });
  }

  getPorMes(request: DashboardFilterDto): Observable<DashboardPorMes[]> {
    const params = Object.assign({}, request);
    return this.getCustom<DashboardPorMes[]>('/por-mes', { params });
  }

  getPorFinalidade(request: DashboardFilterDto): Observable<DashboardPorFinalidade[]> {
    const params = Object.assign({}, request);
    return this.getCustom<DashboardPorFinalidade[]>('/por-finalidade', { params });
  }
}
