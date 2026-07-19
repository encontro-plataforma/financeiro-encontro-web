import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AbstractService } from './abstract.service';
import { Lancamento, LancamentoCreate, LancamentoUpdate } from '../models/lancamento.model';
import { PageTemplate, PageRequest } from './util/PageTemplate';
import { LancamentoFilterDto } from './dto/lancamento-filter.dto';

@Injectable({ providedIn: 'root' })
export class LancamentoService extends AbstractService<Lancamento> {
  constructor(http: HttpClient) {
    super(http, 'lancamentos');
  }

  list(
    request: LancamentoFilterDto,
    pagination?: PageRequest,
  ): Observable<PageTemplate<Lancamento>> {
    const params = Object.assign({}, request, pagination);
    return this.getCustom<PageTemplate<Lancamento>>('', { params });
  }

  listAll(request: LancamentoFilterDto): Observable<Lancamento[]> {
    const params = Object.assign({}, request);
    return this.getCustom<Lancamento[]>('/all', { params });
  }

  buscarPorId(id: number): Observable<Lancamento> {
    return this.getById(id);
  }

  criar(data: LancamentoCreate): Observable<Lancamento> {
    return this.persist<Lancamento>(data);
  }

  editar(id: number, data: LancamentoUpdate): Observable<Lancamento> {
    return this.update<Lancamento>(data, id);
  }

  remover(id: number): Observable<null> {
    return this.delete(id);
  }

  conciliar(id: number, finalidadeId: number, observacao?: string): Observable<Lancamento> {
    const body = observacao != null ? { observacao } : null;
    return this.patch<Lancamento>(body, `/conciliar/${id}/finalidade/${finalidadeId}`);
  }
}
