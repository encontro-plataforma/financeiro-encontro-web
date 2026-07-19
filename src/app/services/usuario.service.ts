import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AbstractService } from './abstract.service';
import { Usuario } from '../models/usuario.model';
import { PageTemplate, PageRequest } from './util/PageTemplate';
import { UsuarioFilterDto } from './dto/usuario-filter.dto';
import { PerfilUsuario } from '../models/constants/perfil';

export interface UsuarioCreate {
  nome:    string;
  email:   string;
  senha:   string;
  perfil:  PerfilUsuario;
  ativo:   boolean;
}

export interface UsuarioUpdate {
  nome:    string;
  email:   string;
  senha?:  string;
  perfil:  PerfilUsuario;
  ativo:   boolean;
}

@Injectable({ providedIn: 'root' })
export class UsuarioService extends AbstractService<Usuario> {
  constructor(http: HttpClient) {
    super(http, 'usuarios');
  }

  list(request: UsuarioFilterDto = {}, pagination?: PageRequest): Observable<PageTemplate<Usuario>> {
    const params = Object.assign({}, request, pagination);
    return this.getCustom<PageTemplate<Usuario>>('', { params });
  }

  buscarPorId(id: number): Observable<Usuario> {
    return this.getById(id);
  }

  criar(data: UsuarioCreate): Observable<Usuario> {
    return this.persist<Usuario>(data);
  }

  editar(id: number, data: UsuarioUpdate): Observable<Usuario> {
    return this.update<Usuario>(data, id);
  }

  remover(id: number): Observable<null> {
    return this.delete(id);
  }
}
