import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AbstractService } from './abstract.service';
import { UploadFile, UploadFileStatus } from '../models/upload-file.model';
import { PageTemplate, PageRequest } from './util/PageTemplate';
import { UploadFileFilterDto } from './dto/upload-file-filter.dto';

@Injectable({ providedIn: 'root' })
export class UploadFileService extends AbstractService<UploadFile> {

  constructor(http: HttpClient) {
    super(http, 'uploads');
  }

  list(request: UploadFileFilterDto, pagination?: PageRequest): Observable<PageTemplate<UploadFile>> {
    const params = Object.assign({}, request, pagination);
    return this.getCustom<PageTemplate<UploadFile>>('', { params });
  }

  listAll(request: UploadFileFilterDto): Observable<UploadFile[]> {
    const params = Object.assign({}, request);
    return this.getCustom<UploadFile[]>('/all', { params });
  }

  buscarPorId(id: number): Observable<UploadFile> {
    return this.getById(id);
  }

  buscarStatusPorId(id: number): Observable<UploadFileStatus> {
    return this.getCustom<UploadFileStatus>(`/${id}/status`);
  }

  remover(id: number): Observable<null> {
    return this.delete(id);
  }

  download(id: number): Observable<Blob> {
    return this.getCustom<Blob>(`/${id}/download`, { responseType: 'blob' as 'json' });
  }
}
