import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AbstractService } from './abstract.service';
import { Encontrista, EncontristaUpdate, PadrinhoResumo } from '../models/encontrista.model';
import { PageTemplate, PageRequest } from './util/PageTemplate';
import { EncontristaFilterDto } from './dto/encontrista-filter.dto';

@Injectable({ providedIn: 'root' })
export class EncontristaService extends AbstractService<Encontrista> {

  constructor(http: HttpClient) {
    super(http, 'encontristas');
  }

  list(request: EncontristaFilterDto = {}, pagination?: PageRequest): Observable<PageTemplate<Encontrista>> {
    const params = Object.assign({}, request, pagination);
    return this.getCustom<PageTemplate<Encontrista>>('', { params });
  }

  listAll(request: EncontristaFilterDto = {}): Observable<Encontrista[]> {
    const params = Object.assign({}, request);
    return this.getCustom<Encontrista[]>('/all', { params });
  }

  buscarPorId(id: number): Observable<Encontrista> {
    return this.getById(id);
  }

  editar(id: number, data: EncontristaUpdate): Observable<Encontrista> {
    return this.update<Encontrista>(data, id);
  }

  padrinhosDisponiveis(): Observable<PadrinhoResumo[]> {
    return this.getCustom<PadrinhoResumo[]>('/padrinhos-disponiveis');
  }
}
