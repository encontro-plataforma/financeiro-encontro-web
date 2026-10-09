import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageEvent } from '@angular/material/paginator';

import { MaterialGlobalModule } from '../../../modules/material.imports.module';
import { UploadIgnoradoProcessamento } from '../../../../models/upload-file.model';

@Component({
  selector: 'app-upload-ignorados-table',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule],
  templateUrl: './upload-ignorados-table.component.html',
  styleUrl: './upload-ignorados-table.component.scss',
})
export class UploadIgnoradosTableComponent implements OnChanges {
  @Input() ignorados: UploadIgnoradoProcessamento[] = [];

  pageIndex = 0;
  readonly pageSize = 6;
  readonly displayedColumns = ['linha', 'idCsv', 'existenteId'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ignorados']) this.pageIndex = 0;
  }

  get pagedIgnorados(): UploadIgnoradoProcessamento[] {
    const start = this.pageIndex * this.pageSize;
    return this.ignorados.slice(start, start + this.pageSize);
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
  }
}
