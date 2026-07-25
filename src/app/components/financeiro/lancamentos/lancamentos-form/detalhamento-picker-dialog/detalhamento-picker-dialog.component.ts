import { ChangeDetectorRef, Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { MaterialGlobalModule, MaterialFormsModule } from '../../../../../shared/modules/material.imports.module';
import { ToastService } from '../../../../../shared/components/toast/toast.service';
import { ErrorHandlerService } from '../../../../../shared/services/error-handler.service';
import { DetalhamentoService } from '../../../../../services/detalhamento.service';
import { EncontreiroService } from '../../../../../services/encontreiro.service';
import { EncontristaService } from '../../../../../services/encontrista.service';
import { PageTemplate } from '../../../../../services/util/PageTemplate';

export interface DetalhamentoPickerDialogData {
  lancamentoId: number;
}

type TipoEscolha = 'OFERTA' | 'OUTRO' | 'INSCRICAO_ENCONTREIRO' | 'INSCRICAO_ENCONTRISTA';

interface PickerRow {
  id:            number;
  nome:          string;
  apelido:       string | null;
  nome_pagador:  string | null;
  dt_pagamento:  string | null;
  pagamento:     number | null;
  observacao:    string | null;
}

@Component({
  selector: 'app-detalhamento-picker-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialGlobalModule, MaterialFormsModule],
  templateUrl: './detalhamento-picker-dialog.component.html',
  styleUrl: './detalhamento-picker-dialog.component.scss',
})
export class DetalhamentoPickerDialogComponent {
  private detalhamentoService = inject(DetalhamentoService);
  private encontreiroService  = inject(EncontreiroService);
  private encontristaService  = inject(EncontristaService);
  private toast                 = inject(ToastService);
  private errorHandler          = inject(ErrorHandlerService);
  private cdr                    = inject(ChangeDetectorRef);
  private dialogRef              = inject(MatDialogRef<DetalhamentoPickerDialogComponent, boolean>);

  tipo: TipoEscolha | null = null;
  salvando = false;

  // Oferta / Outro
  valorSimples: number | null = null;
  descricaoSimples = '';

  // Inscrição (Encontreiro / Encontrista)
  resultInscricao: PageTemplate<PickerRow> = new PageTemplate<PickerRow>();
  loading    = false;
  searchInscricao = '';
  pageIndex  = 0;
  pageSize   = 8;

  private searchSubject = new Subject<string>();

  constructor(@Inject(MAT_DIALOG_DATA) public data: DetalhamentoPickerDialogData) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(() => {
      this.pageIndex = 0;
      this.loadInscricoes();
    });
  }

  escolherTipo(tipo: TipoEscolha): void {
    this.tipo = tipo;
    if (tipo === 'INSCRICAO_ENCONTREIRO' || tipo === 'INSCRICAO_ENCONTRISTA') {
      this.pageIndex = 0;
      this.searchInscricao = '';
      this.loadInscricoes();
    }
  }

  voltarEscolha(): void {
    this.tipo = null;
  }

  onSearchInscricaoChange(): void {
    this.searchSubject.next(this.searchInscricao);
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize  = event.pageSize;
    this.loadInscricoes();
  }

  private loadInscricoes(): void {
    this.loading = true;

    const filtro = {
      ...(this.searchInscricao ? { nome_ou_apelido: this.searchInscricao } : {}),
      auditado: false,
    };
    const pagination = { skip: this.pageIndex * this.pageSize, limit: this.pageSize, sort: ['dt_pagamento:desc'] };

    const onResult = (data: PageTemplate<PickerRow>) => {
      this.resultInscricao = data;
      this.loading = false;
      this.cdr.detectChanges();
    };
    const onError = () => {
      this.loading = false;
      this.cdr.detectChanges();
    };

    if (this.tipo === 'INSCRICAO_ENCONTREIRO') {
      this.encontreiroService.list(filtro, pagination).subscribe({ next: onResult, error: onError });
    } else {
      this.encontristaService.list(filtro, pagination).subscribe({ next: onResult, error: onError });
    }
  }

  selecionarInscricao(row: PickerRow): void {
    if (!row.pagamento) {
      this.toast.warning({ message: 'Esta inscrição não tem valor de pagamento definido.' });
      return;
    }

    this.salvando = true;
    this.detalhamentoService.criar({
      lancamento_id: this.data.lancamentoId,
      tipo: this.tipo as string,
      referencia_id: row.id,
      valor: row.pagamento,
    }).subscribe({
      next: () => {
        this.salvando = false;
        this.toast.success({ message: 'Detalhamento criado com sucesso.' });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.salvando = false;
        this.errorHandler.handler(err);
      },
    });
  }

  salvarSimples(): void {
    if (!this.valorSimples || this.valorSimples <= 0) {
      this.toast.warning({ message: 'Informe um valor válido.' });
      return;
    }

    this.salvando = true;
    this.detalhamentoService.criar({
      lancamento_id: this.data.lancamentoId,
      tipo: this.tipo as string,
      valor: this.valorSimples,
      descricao: this.descricaoSimples,
    }).subscribe({
      next: () => {
        this.salvando = false;
        this.toast.success({ message: 'Detalhamento criado com sucesso.' });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.salvando = false;
        this.errorHandler.handler(err);
      },
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
