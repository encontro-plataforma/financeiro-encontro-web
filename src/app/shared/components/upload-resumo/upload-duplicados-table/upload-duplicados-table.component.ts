import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageEvent } from '@angular/material/paginator';

import { MaterialGlobalModule } from '../../../modules/material.imports.module';
import { UploadDuplicadoProcessamento } from '../../../../models/upload-file.model';

@Component({
  selector: 'app-upload-duplicados-table',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule],
  templateUrl: './upload-duplicados-table.component.html',
  styleUrl: './upload-duplicados-table.component.scss',
})
export class UploadDuplicadosTableComponent implements OnChanges {
  @Input() duplicados: UploadDuplicadoProcessamento[] = [];

  pageIndex = 0;
  readonly pageSize = 6;
  readonly displayedColumns = ['linha', 'descricao', 'valor', 'data'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['duplicados']) this.pageIndex = 0;
  }

  get pagedDuplicados(): UploadDuplicadoProcessamento[] {
    const start = this.pageIndex * this.pageSize;
    return this.duplicados.slice(start, start + this.pageSize);
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
  }
}
