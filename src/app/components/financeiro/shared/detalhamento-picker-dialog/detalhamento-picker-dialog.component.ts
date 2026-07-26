import { ChangeDetectorRef, Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { MaterialGlobalModule, MaterialFormsModule } from '../../../../shared/modules/material.imports.module';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { ErrorHandlerService } from '../../../../shared/services/error-handler.service';
import { DetalhamentoService } from '../../../../services/detalhamento.service';
import { EncontreiroService } from '../../../../services/encontreiro.service';
import { EncontristaService } from '../../../../services/encontrista.service';
import { PageTemplate } from '../../../../services/util/PageTemplate';
import { Detalhamento } from '../../../../models/detalhamento.model';

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

const LABEL_POR_TIPO: Record<string, string> = {
  INSCRICAO_ENCONTREIRO: 'Inscrição de Encontreiro',
  INSCRICAO_ENCONTRISTA: 'Inscrição de Encontrista',
  OFERTA: 'Oferta',
  OUTRO: 'Outro',
};

@Component({
  selector: 'app-detalhamento-picker-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialGlobalModule, MaterialFormsModule],
  templateUrl: './detalhamento-picker-dialog.component.html',
  styleUrl: './detalhamento-picker-dialog.component.scss',
})
export class DetalhamentoPickerDialogComponent implements OnInit {
  private detalhamentoService = inject(DetalhamentoService);
  private encontreiroService  = inject(EncontreiroService);
  private encontristaService  = inject(EncontristaService);
  private toast                 = inject(ToastService);
  private errorHandler          = inject(ErrorHandlerService);
  private cdr                    = inject(ChangeDetectorRef);
  private matDialog               = inject(MatDialog);
  private dialogRef              = inject(MatDialogRef<DetalhamentoPickerDialogComponent, boolean>);

  tipo: TipoEscolha | null = null;
  salvando = false;
  houveAlteracao = false;

  // Lista atual de detalhamentos do lançamento
  detalhamentos: Detalhamento[] = [];
  loadingLista = false;

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

  ngOnInit(): void {
    this.carregarLista();
  }

  get subtitulo(): string {
    return this.tipo ? `Selecionando detalhamento para ${LABEL_POR_TIPO[this.tipo]}` : '';
  }

  private carregarLista(): void {
    this.loadingLista = true;
    this.detalhamentoService.listAll({ lancamento_id: this.data.lancamentoId }).subscribe({
      next: (data) => {
        this.detalhamentos = data;
        this.loadingLista = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingLista = false;
        this.cdr.detectChanges();
      },
    });
  }

  escolherTipo(tipo: TipoEscolha): void {
    this.tipo = tipo;
    this.valorSimples = null;
    this.descricaoSimples = '';
    if (tipo === 'INSCRICAO_ENCONTREIRO' || tipo === 'INSCRICAO_ENCONTRISTA') {
      this.pageIndex = 0;
      this.searchInscricao = '';
      this.dialogRef.updateSize('60vw');
      this.loadInscricoes();
    } else {
      this.dialogRef.updateSize('700px');
    }
  }

  voltarEscolha(): void {
    this.tipo = null;
    this.dialogRef.updateSize('700px');
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
        this.houveAlteracao = true;
        this.toast.success({ message: 'Detalhamento criado com sucesso.' });
        this.tipo = null;
        this.dialogRef.updateSize('700px');
        this.carregarLista();
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
        this.houveAlteracao = true;
        this.toast.success({ message: 'Detalhamento criado com sucesso.' });
        this.tipo = null;
        this.dialogRef.updateSize('700px');
        this.carregarLista();
      },
      error: (err) => {
        this.salvando = false;
        this.errorHandler.handler(err);
      },
    });
  }

  excluir(det: Detalhamento): void {
    this.matDialog.open(ConfirmDialogComponent, {
      width: '440px',
      data: {
        title:   'Remover detalhamento',
        message: `Deseja remover o detalhamento "${this.tipoLabel(det.tipo)} — ${det.detalhe_nome}"?`,
      },
    }).afterClosed().subscribe((ok: boolean) => {
      if (!ok) return;
      this.detalhamentoService.remover(det.id).subscribe({
        next: () => {
          this.houveAlteracao = true;
          this.toast.success({ message: 'Detalhamento removido com sucesso.' });
          this.carregarLista();
        },
        error: (err) => this.errorHandler.handler(err),
      });
    });
  }

  tipoLabel(tipo: string): string {
    return LABEL_POR_TIPO[tipo] ?? tipo;
  }

  fechar(): void {
    this.dialogRef.close(this.houveAlteracao);
  }
}
