import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AbstractService } from './abstract.service';
import { Finalidade, FinalidadeCreate, FinalidadeUpdate } from '../models/finalidade.model';
import { PageTemplate, PageRequest } from './util/PageTemplate';
import { FinalidadeFilterDto } from './dto/finalidade-filter.dto';

@Injectable({ providedIn: 'root' })
export class FinalidadeService extends AbstractService<Finalidade> {

  constructor(http: HttpClient) {
    super(http, 'finalidades');
  }

  list(request: FinalidadeFilterDto = {}, pagination?: PageRequest): Observable<PageTemplate<Finalidade>> {
    const params = Object.assign({}, request, pagination);
    return this.getCustom<PageTemplate<Finalidade>>('', { params });
  }

  listAll(request: FinalidadeFilterDto = {}): Observable<Finalidade[]> {
    const params = Object.assign({}, request);
    return this.getCustom<Finalidade[]>('/all', { params });
  }

  buscarPorId(id: number): Observable<Finalidade> {
    return this.getById(id);
  }

  criar(data: FinalidadeCreate): Observable<Finalidade> {
    return this.persist<Finalidade>(data);
  }

  editar(id: number, data: FinalidadeUpdate): Observable<Finalidade> {
    return this.update<Finalidade>(data, id);
  }

  remover(id: number): Observable<null> {
    return this.delete(id);
  }
}
