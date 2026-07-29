import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageEvent } from '@angular/material/paginator';

import { MaterialGlobalModule } from '../../../modules/material.imports.module';
import { UploadErroProcessamento } from '../../../../models/upload-file.model';

@Component({
  selector: 'app-upload-erros-table',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule],
  templateUrl: './upload-erros-table.component.html',
  styleUrl: './upload-erros-table.component.scss',
})
export class UploadErrosTableComponent implements OnChanges {
  @Input() erros: UploadErroProcessamento[] = [];

  pageIndex = 0;
  readonly pageSize = 6;
  readonly displayedColumns = ['linha', 'descricao', 'erro'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['erros']) this.pageIndex = 0;
  }

  get pagedErros(): UploadErroProcessamento[] {
    const start = this.pageIndex * this.pageSize;
    return this.erros.slice(start, start + this.pageSize);
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
  }
}
