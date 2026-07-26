import { ChangeDetectorRef, Component, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { MaterialGlobalModule, MaterialFormsModule } from '../../modules/material.imports.module';
import { LancamentoService } from '../../../services/lancamento.service';
import { Lancamento } from '../../../models/lancamento.model';
import { TipoLancamento } from '../../../models/constants/tipo-lancamento';
import { PageTemplate } from '../../../services/util/PageTemplate';

@Component({
  selector: 'app-lancamento-picker-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialGlobalModule, MaterialFormsModule],
  templateUrl: './lancamento-picker-dialog.component.html',
  styleUrl: './lancamento-picker-dialog.component.scss',
})
export class LancamentoPickerDialogComponent implements AfterViewInit {
  private lancamentoService = inject(LancamentoService);
  private cdr                = inject(ChangeDetectorRef);
  private dialogRef          = inject(MatDialogRef<LancamentoPickerDialogComponent, Lancamento>);

  result: PageTemplate<Lancamento> = new PageTemplate<Lancamento>();
  loading   = false;
  pageIndex = 0;
  pageSize  = 8;
  search    = '';

  displayedColumns = ['data_pagamento', 'descricao', 'valor', 'status'];

  private searchSubject = new Subject<string>();

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(() => {
      this.pageIndex = 0;
      this.load();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.load());
  }

  onSearchChange(): void {
    this.searchSubject.next(this.search);
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize  = event.pageSize;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.lancamentoService
      .list(
        { tipo: TipoLancamento.RECEITA, ...(this.search ? { descricao: this.search } : {}) },
        { skip: this.pageIndex * this.pageSize, limit: this.pageSize, sort: ['data_pagamento:desc'] },
      )
      .subscribe({
        next: (data) => {
          this.result  = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  selecionar(lancamento: Lancamento): void {
    this.dialogRef.close(lancamento);
  }

  cancelar(): void {
    this.dialogRef.close();
  }

  statusLabel(status: string): string {
    return status === 'CONCILIADO' ? 'Conciliado' : 'Não conciliado';
  }
}
