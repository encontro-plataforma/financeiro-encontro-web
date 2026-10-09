import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageEvent } from '@angular/material/paginator';

import { MaterialGlobalModule } from '../../../modules/material.imports.module';
import { UploadInseridoProcessamento } from '../../../../models/upload-file.model';

@Component({
  selector: 'app-upload-inseridos-table',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule],
  templateUrl: './upload-inseridos-table.component.html',
  styleUrl: './upload-inseridos-table.component.scss',
})
export class UploadInseridosTableComponent implements OnChanges {
  @Input() inseridos: UploadInseridoProcessamento[] = [];

  pageIndex = 0;
  readonly pageSize = 6;
  readonly displayedColumns = ['linha', 'descricao', 'valor', 'data'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['inseridos']) this.pageIndex = 0;
  }

  get pagedInseridos(): UploadInseridoProcessamento[] {
    const start = this.pageIndex * this.pageSize;
    return this.inseridos.slice(start, start + this.pageSize);
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
  }
}
