import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { AbstractService } from './abstract.service';
import { ExtratoBancario } from '../models/extrato-bancario.model';
import { PageTemplate, PageRequest } from './util/PageTemplate';
import { ExtratoBancarioFilterDto } from './dto/extrato-bancario-filter.dto';

@Injectable({ providedIn: 'root' })
export class ExtratoBancarioService extends AbstractService<ExtratoBancario> {

  constructor(http: HttpClient) {
    super(http, 'extratos-bancarios');
  }

  list(request: ExtratoBancarioFilterDto, pagination?: PageRequest): Observable<PageTemplate<ExtratoBancario>> {
    const params = Object.assign({}, request, pagination);
    return this.getCustom<PageTemplate<ExtratoBancario>>('', { params });
  }

  listAll(request: ExtratoBancarioFilterDto): Observable<ExtratoBancario[]> {
    const params = Object.assign({}, request);
    return this.getCustom<ExtratoBancario[]>('/all', { params });
  }

  buscarPorId(id: number): Observable<ExtratoBancario> {
    return this.getById(id);
  }

  remover(id: number): Observable<null> {
    return this.delete(id);
  }

  download(id: number): Observable<Blob> {
    return this.getCustom<Blob>(`/${id}/download`, { responseType: 'blob' as 'json' });
    // return this._http.get(
    //   `${environment.API_URL}/extratos-bancarios/${id}/download`,
    //   { responseType: 'blob', withCredentials: true }
    // );
  }
}
