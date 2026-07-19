import { Injectable } from '@angular/core';
import { DashboardFilterDto } from './dto/dashboard-filter.dto';

@Injectable({ providedIn: 'root' })
export class DashboardStateService {
  filtrosAtivos: DashboardFilterDto | null = null;
  finalidadeIdReceita: number | null = null;
  finalidadeIdDespesa: number | null = null;
  pageIndexReceita = 0;
  pageIndexDespesa = 0;
}
