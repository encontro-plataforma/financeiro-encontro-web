import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AbstractService } from './abstract.service';

@Injectable({ providedIn: 'root' })
export class RelatorioSecretariaService extends AbstractService {
  constructor(http: HttpClient) {
    super(http, 'relatorios-secretaria');
  }

  gerarEncontristasPorCirculo(): Observable<Blob> {
    return this.getCustom<Blob>('/encontristas-por-circulo', { responseType: 'blob' });
  }

  gerarComorbidades(): Observable<Blob> {
    return this.getCustom<Blob>('/comorbidades', { responseType: 'blob' });
  }
}
