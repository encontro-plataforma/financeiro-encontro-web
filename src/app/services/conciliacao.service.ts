import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AbstractService } from './abstract.service';

export interface ResultadoConciliacao {
  inseridos:   number;
  duplicados:  number;
  erros:       number;
  mensagem:    string;
}

@Injectable({ providedIn: 'root' })
export class ConciliacaoService extends AbstractService<ResultadoConciliacao> {

  constructor(http: HttpClient) {
    super(http, 'conciliacao');
  }

  upload(file: File): Observable<ResultadoConciliacao> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.persist<ResultadoConciliacao>(formData, '/upload');
  }
}
