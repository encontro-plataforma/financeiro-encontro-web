import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AbstractService } from './abstract.service';
import { Encontreiro, EncontreiroUpdate } from '../models/encontreiro.model';
import { PageTemplate, PageRequest } from './util/PageTemplate';
import { EncontreiroFilterDto } from './dto/encontreiro-filter.dto';

@Injectable({ providedIn: 'root' })
export class EncontreiroService extends AbstractService<Encontreiro> {

  constructor(http: HttpClient) {
    super(http, 'encontreiros');
  }

  list(request: EncontreiroFilterDto = {}, pagination?: PageRequest): Observable<PageTemplate<Encontreiro>> {
    const params = Object.assign({}, request, pagination);
    return this.getCustom<PageTemplate<Encontreiro>>('', { params });
  }

  listAll(request: EncontreiroFilterDto = {}): Observable<Encontreiro[]> {
    const params = Object.assign({}, request);
    return this.getCustom<Encontreiro[]>('/all', { params });
  }

  buscarPorId(id: number): Observable<Encontreiro> {
    return this.getById(id);
  }

  editar(id: number, data: EncontreiroUpdate): Observable<Encontreiro> {
    return this.update<Encontreiro>(data, id);
  }
}
