import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AbstractService } from './abstract.service';

@Injectable({ providedIn: 'root' })
export class RelatorioService extends AbstractService {
  constructor(http: HttpClient) {
    super(http, 'relatorios');
  }

  gerarLivroCaixa(dataInicio: string, dataFim: string): Observable<Blob> {
    return this.getCustom<Blob>('/livro-caixa', {
      params: { data_inicio: dataInicio, data_fim: dataFim },
      responseType: 'blob',
    });
  }

  gerarResumoGeral(dataInicio: string, dataFim: string): Observable<Blob> {
    return this.getCustom<Blob>('/resumo-geral', {
      params: { data_inicio: dataInicio, data_fim: dataFim },
      responseType: 'blob',
    });
  }
}
