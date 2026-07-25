import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AbstractService } from './abstract.service';
import { Equipe, EquipeCreate, EquipeUpdate } from '../models/equipe.model';
import { PageTemplate, PageRequest } from './util/PageTemplate';
import { EquipeFilterDto } from './dto/equipe-filter.dto';

@Injectable({ providedIn: 'root' })
export class EquipeService extends AbstractService<Equipe> {

  constructor(http: HttpClient) {
    super(http, 'equipes');
  }

  list(request: EquipeFilterDto = {}, pagination?: PageRequest): Observable<PageTemplate<Equipe>> {
    const params = Object.assign({}, request, pagination);
    return this.getCustom<PageTemplate<Equipe>>('', { params });
  }

  listAll(request: EquipeFilterDto = {}): Observable<Equipe[]> {
    const params = Object.assign({}, request);
    return this.getCustom<Equipe[]>('/all', { params });
  }

  buscarPorId(id: number): Observable<Equipe> {
    return this.getById(id);
  }

  criar(data: EquipeCreate): Observable<Equipe> {
    return this.persist<Equipe>(data);
  }

  editar(id: number, data: EquipeUpdate): Observable<Equipe> {
    return this.update<Equipe>(data, id);
  }

  remover(id: number): Observable<null> {
    return this.delete(id);
  }
}
