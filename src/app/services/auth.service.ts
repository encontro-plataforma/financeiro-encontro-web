import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';

import { AbstractService } from './abstract.service';
import { Usuario } from '../models/usuario.model';
import { LoginRequest, TokenResponse } from '../models/auth.model';

const TOKEN_KEY = 'auth_token';
const USUARIO_KEY = 'auth_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService extends AbstractService<Usuario> {

  constructor(http: HttpClient) {
    super(http, 'auth');
  }

  login(request: LoginRequest): Observable<TokenResponse> {
    return this.persist<TokenResponse>(request, '/login').pipe(
      tap(response => this.saveToken(response.access_token)),
      switchMap(response =>
        this.me().pipe(
          tap(usuario => this.saveUsuario(usuario)),
          map(() => response)
        )
      )
    );
  }

  me(): Observable<Usuario> {
    return this.getCustom<Usuario>('/me');
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
  }

  saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  saveUsuario(usuario: Usuario): void {
    localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
  }

  getUsuario(): Usuario | null {
    const raw = localStorage.getItem(USUARIO_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
