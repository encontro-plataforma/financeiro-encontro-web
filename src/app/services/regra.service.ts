import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AbstractService } from './abstract.service';
import { RegraGrupo, RegraGrupoUpdate } from '../models/regra-grupo.model';

@Injectable({ providedIn: 'root' })
export class RegraService extends AbstractService<RegraGrupo> {

  constructor(http: HttpClient) {
    super(http, 'regras/grupos');
  }

  listAll(): Observable<RegraGrupo[]> {
    return this.getCustom<RegraGrupo[]>('/all');
  }

  buscarPorId(id: number): Observable<RegraGrupo> {
    return this.getById(id);
  }

  editar(id: number, data: RegraGrupoUpdate): Observable<RegraGrupo> {
    return this.update<RegraGrupo>(data, id);
  }
}
