import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AbstractService } from './abstract.service';
import { Detalhamento, DetalhamentoCreate, DetalhamentoUpdate } from '../models/detalhamento.model';
import { PageTemplate, PageRequest } from './util/PageTemplate';
import { DetalhamentoFilterDto } from './dto/detalhamento-filter.dto';

@Injectable({ providedIn: 'root' })
export class DetalhamentoService extends AbstractService<Detalhamento> {

  constructor(http: HttpClient) {
    super(http, 'detalhamentos');
  }

  list(request: DetalhamentoFilterDto = {}, pagination?: PageRequest): Observable<PageTemplate<Detalhamento>> {
    const params = Object.assign({}, request, pagination);
    return this.getCustom<PageTemplate<Detalhamento>>('', { params });
  }

  listAll(request: DetalhamentoFilterDto = {}): Observable<Detalhamento[]> {
    const params = Object.assign({}, request);
    return this.getCustom<Detalhamento[]>('/all', { params });
  }

  buscarPorId(id: number): Observable<Detalhamento> {
    return this.getById(id);
  }

  criar(data: DetalhamentoCreate): Observable<Detalhamento> {
    return this.persist<Detalhamento>(data);
  }

  editar(id: number, data: DetalhamentoUpdate): Observable<Detalhamento> {
    return this.update<Detalhamento>(data, id);
  }

  remover(id: number): Observable<null> {
    return this.delete(id);
  }
}
