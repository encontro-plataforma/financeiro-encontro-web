import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AbstractService } from './abstract.service';
import { Circulo, CirculoCreate, CirculoUpdate } from '../models/circulo.model';
import { PageTemplate, PageRequest } from './util/PageTemplate';
import { CirculoFilterDto } from './dto/circulo-filter.dto';

@Injectable({ providedIn: 'root' })
export class CirculoService extends AbstractService<Circulo> {

  constructor(http: HttpClient) {
    super(http, 'circulos');
  }

  list(request: CirculoFilterDto = {}, pagination?: PageRequest): Observable<PageTemplate<Circulo>> {
    const params = Object.assign({}, request, pagination);
    return this.getCustom<PageTemplate<Circulo>>('', { params });
  }

  listAll(request: CirculoFilterDto = {}): Observable<Circulo[]> {
    const params = Object.assign({}, request);
    return this.getCustom<Circulo[]>('/all', { params });
  }

  buscarPorId(id: number): Observable<Circulo> {
    return this.getById(id);
  }

  criar(data: CirculoCreate): Observable<Circulo> {
    return this.persist<Circulo>(data);
  }

  editar(id: number, data: CirculoUpdate): Observable<Circulo> {
    return this.update<Circulo>(data, id);
  }

  remover(id: number): Observable<null> {
    return this.delete(id);
  }
}
