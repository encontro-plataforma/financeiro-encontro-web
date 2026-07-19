import { HttpClient, HttpParams } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/** Classe abstrata para servir como BASE para todos os serviços. */
export abstract class AbstractService<M = any> {
    private _url = environment.API_URL;

    private defaultOptions = {
      withCredentials: true,
      responseType: 'json' as 'json',
    };

    constructor(protected _http: HttpClient,
                protected _actionUrl: string,
                public _maxItensPage: number = 10)
    { }

    public get name() {
        return this._actionUrl;
    }

    persist<T = M>(model: any, action: string = '', options?: any): Observable<T> {
      return this._http
                .post<T>(`${this._url}/${this._actionUrl}${action}`, model, this.getOptions(options));
    }

    update<T = any>(model: any, id?: number, action: string = '', options?: any): Observable<T> {
      let _url = `${this._url}/${this._actionUrl}`;
      if (id !== null) {
        _url += `/${id}`;
      }
      _url += `${action}`;

      return this._http
              .put<T>(_url, model, this.getOptions(options));
    }

    patch<T = any>(model: any, action: string = '', options?: any): Observable<T> {
      let _url = `${this._url}/${this._actionUrl}`;
      _url += `${action}`;

      return this._http
              .patch<T>(_url, model, this.getOptions(options));
    }

    delete(id: number, action: string = '', options?: any) {
      let _url = `${this._url}/${this._actionUrl}`;
      if (id !== null) {
        _url += `/${id}`;
      }
      _url += `${action}`;

      return this._http
                .delete(_url, this.getOptions(options))
                .pipe(map(() => null));
    }

    getCustom<T = any>(action: string = '', options?: any): Observable<T> {
        return this._http
                  .get<T>(`${this._url}/${this._actionUrl}${action}`, this.getOptions(options));
    }

    getById(id: number, options?: any) {
      return this._http
                .get<M>(`${this._url}/${this._actionUrl}/${id}`, this.getOptions(options));
    }

    getByCode(codigo: string, options?: any) {
      return this._http
                .get<M>(`${this._url}/${this._actionUrl}/${codigo}`, this.getOptions(options));
    }

    hasField(fieldName: string, fieldValue: string, params?: string) {
      let url = `/has-field/${fieldName}/${fieldValue}`;

      if (!params === false) {
        url += `/?${params}`;
      }

      return this.getCustom<{ hasField: boolean }>(url)
            .pipe(
              map(resp => resp.hasField)
            );
    }

    private getOptions(options?: any) {
      let optionRet = this.defaultOptions;
      if (options) optionRet = { ...this.defaultOptions, ...options };

      return optionRet;
    }
}
