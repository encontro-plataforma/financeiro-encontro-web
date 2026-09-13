import { ChangeDetectorRef, Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {
  MaterialGlobalModule,
  MaterialFormsModule,
} from '../../../shared/modules/material.imports.module';
import {
  MultiSelectComponent,
  MultiSelectItem,
} from '../../../shared/components/multi-select/multi-select.component';
import { CsvUploadDialogComponent } from '../../../shared/components/csv-upload-dialog/csv-upload-dialog.component';
import {
  EquipePickerDialogComponent,
  acessoCorFundo,
} from '../../../shared/components/equipe-picker-dialog/equipe-picker-dialog.component';
import { TelefoneBrPipe } from '../../../shared/pipes/telefone-br.pipe';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { EncontreiroService } from '../../../services/encontreiro.service';
import { EquipeService } from '../../../services/equipe.service';
import { DetalhamentoService } from '../../../services/detalhamento.service';
import { ListFilterBase } from '../../../shared/classes/list-filter-base';
import { Encontreiro } from '../../../models/encontreiro.model';
import { Equipe } from '../../../models/equipe.model';
import { Detalhamento } from '../../../models/detalhamento.model';
import { AcessoEquipe } from '../../../models/constants/acesso-equipe';
import { FormaPagamento } from '../../../models/constants/forma-pagamento';
import { PageTemplate } from '../../../services/util/PageTemplate';
import { SituacaoCamisa } from '../../../models/constants/situacao-camisa';

const AUDITADO_TODOS = '-1';

@Component({
  selector: 'app-encontreiros',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialGlobalModule,
    MaterialFormsModule,
    MultiSelectComponent,
    TelefoneBrPipe,
  ],
  templateUrl: './encontreiros.component.html',
  styleUrl: './encontreiros.component.scss',
})
export class EncontreirosComponent extends ListFilterBase implements OnInit, AfterViewInit {
  private encontreiroService = inject(EncontreiroService);
  private equipeService = inject(EquipeService);
  private detalhamentoService = inject(DetalhamentoService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private errorHandler = inject(ErrorHandlerService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  readonly FormaPagamento = FormaPagamento;

  result: PageTemplate<Encontreiro> = new PageTemplate<Encontreiro>();
  loading = false;

  lancamentosVinculadosPorLinha: Record<number, Detalhamento[]> = {};
  carregandoLancamentosVinculados: Record<number, boolean> = {};

  search = '';
  nomePagador = '';
  equipeSelecionadas: number[] = [];
  situacaoSelecionadas: string[] = [];
  auditadoFiltro = AUDITADO_TODOS;

  equipeItems: MultiSelectItem[] = [];
  readonly situacaoItems: MultiSelectItem[] = SituacaoCamisa.options.map((op) => ({
    id: op.value,
    label: op.name,
  }));

  readonly auditadoOpcoes = [
    { name: 'Todos', value: AUDITADO_TODOS },
    { name: 'Sim', value: 'true' },
    { name: 'Não', value: 'false' },
  ];

  displayedColumns = [
    'id',
    'dt_inscricao',
    'detalhes',
    'equipe',
    'camisa',
    'situacao_camisa',
    'acoes',
  ];

  private searchSubject = new Subject<string>();
  private nomePagadorSubject = new Subject<string>();

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.pageIndex = 0;
      this.saveState({
        search: this.search,
        nomePagador: this.nomePagador,
        equipeSelecionadas: this.equipeSelecionadas,
        situacaoSelecionadas: this.situacaoSelecionadas,
        auditadoFiltro: this.auditadoFiltro,
      });
      this.load();
    });

    this.nomePagadorSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.pageIndex = 0;
      this.saveState({
        search: this.search,
        nomePagador: this.nomePagador,
        equipeSelecionadas: this.equipeSelecionadas,
        situacaoSelecionadas: this.situacaoSelecionadas,
        auditadoFiltro: this.auditadoFiltro,
      });
      this.load();
    });

    this.equipeService.listAll().subscribe((equipes) => {
      this.equipeItems = equipes.map((e) => ({ id: e.id, label: e.nome }));
      this.cdr.detectChanges();
    });

    // restore state
    this.initFilter('encontreiros', (saved) => {
      this.search = saved.search ?? this.search;
      this.nomePagador = saved.nomePagador ?? this.nomePagador;
      this.equipeSelecionadas = saved.equipeSelecionadas ?? this.equipeSelecionadas;
      this.situacaoSelecionadas = saved.situacaoSelecionadas ?? this.situacaoSelecionadas;
      this.auditadoFiltro = saved.auditadoFiltro ?? this.auditadoFiltro;
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.load());
  }

  onSearchChange(): void {
    this.searchSubject.next(this.search);
  }

  onNomePagadorChange(): void {
    this.nomePagadorSubject.next(this.nomePagador);
  }

  onEquipeChange(ids: (string | number)[]): void {
    this.equipeSelecionadas = ids as number[];
    this.pageIndex = 0;
    this.saveState({
      search: this.search,
      nomePagador: this.nomePagador,
      equipeSelecionadas: this.equipeSelecionadas,
      situacaoSelecionadas: this.situacaoSelecionadas,
      auditadoFiltro: this.auditadoFiltro,
    });
    this.load();
  }

  onSituacaoChange(ids: (string | number)[]): void {
    this.situacaoSelecionadas = ids as string[];
    this.pageIndex = 0;
    this.saveState({
      search: this.search,
      nomePagador: this.nomePagador,
      equipeSelecionadas: this.equipeSelecionadas,
      situacaoSelecionadas: this.situacaoSelecionadas,
      auditadoFiltro: this.auditadoFiltro,
    });
    this.load();
  }

  onAuditadoChange(): void {
    this.pageIndex = 0;
    this.saveState({
      search: this.search,
      nomePagador: this.nomePagador,
      equipeSelecionadas: this.equipeSelecionadas,
      situacaoSelecionadas: this.situacaoSelecionadas,
      auditadoFiltro: this.auditadoFiltro,
    });
    this.load();
  }

  onPage(event: PageEvent): void {
    this.handlePage(
      event,
      () => ({
        search: this.search,
        nomePagador: this.nomePagador,
        equipeSelecionadas: this.equipeSelecionadas,
        situacaoSelecionadas: this.situacaoSelecionadas,
        auditadoFiltro: this.auditadoFiltro,
      }),
      () => this.load(),
    );
  }

  load(): void {
    this.loading = true;
    this.encontreiroService
      .list(
        {
          ...(this.search ? { nome_ou_apelido: this.search } : {}),
          ...(this.nomePagador ? { nome_pagador: this.nomePagador } : {}),
          ...(this.equipeSelecionadas.length ? { equipe_ids: this.equipeSelecionadas } : {}),
          ...(this.situacaoSelecionadas.length
            ? { situacao_camisa: this.situacaoSelecionadas }
            : {}),
          ...(this.auditadoFiltro !== AUDITADO_TODOS
            ? { auditado: this.auditadoFiltro === 'true' }
            : {}),
        },
        { skip: this.pageIndex * this.pageSize, limit: this.pageSize },
      )
      .subscribe({
        next: (data) => {
          this.result = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.loading = false;
          this.errorHandler.handler(err);
          this.cdr.detectChanges();
        },
      });
  }

  editar(id: number): void {
    this.router.navigate(['/secretaria/encontreiros', id, 'editar']);
  }

  carregarLancamentosVinculados(row: Encontreiro): void {
    if (this.lancamentosVinculadosPorLinha[row.id]) return;

    this.carregandoLancamentosVinculados[row.id] = true;
    this.detalhamentoService
      .listAll({ referencia_id: row.id, tipo: 'INSCRICAO_ENCONTREIRO' })
      .subscribe({
        next: (data) => {
          this.lancamentosVinculadosPorLinha[row.id] = data;
          this.carregandoLancamentosVinculados[row.id] = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.carregandoLancamentosVinculados[row.id] = false;
          this.cdr.detectChanges();
        },
      });
  }

  descricaoLancamentoVinculado(det: Detalhamento): string {
    if (!det.lancamento) return '';
    const { descricao, forma_pagamento, cart_parcelas } = det.lancamento;
    return forma_pagamento === FormaPagamento.CARTAO_CREDITO && cart_parcelas && cart_parcelas > 1
      ? `${descricao} em ${cart_parcelas} parcelas`
      : descricao;
  }

  abrirLancamento(lancamentoId: number): void {
    this.router.navigate(['/lancamentos', lancamentoId, 'editar'], {
      state: { returnUrl: this.router.url },
    });
  }

  enviarCsv(): void {
    CsvUploadDialogComponent.open(this.dialog, {
      titulo: 'Importar Encontreiros',
      endpoint: '/encontreiros/conciliacao',
    })
      .afterClosed()
      .subscribe(() => this.load());
  }

  getSituacaoLabel(situacao: string): string {
    return SituacaoCamisa.getDescription(situacao);
  }

  equipeCorFundo(equipe: Equipe | null | undefined): string | null {
    return acessoCorFundo(equipe?.acesso);
  }

  isCancelado(row: Encontreiro): boolean {
    return row.equipe?.acesso === AcessoEquipe.NA;
  }

  abrirEquipePicker(row: Encontreiro): void {
    this.dialog
      .open<EquipePickerDialogComponent, unknown, Equipe>(EquipePickerDialogComponent, {
        width: '820px',
        maxWidth: '95vw',
        data: { equipeAtualId: row.equipe_id },
      })
      .afterClosed()
      .subscribe((equipe) => {
        if (!equipe || equipe.id === row.equipe_id) return;

        this.encontreiroService.alterarEquipe(row.id, equipe.id).subscribe({
          next: () => {
            this.toast.success({ message: 'Equipe atualizada com sucesso.' });
            this.load();
          },
          error: (err) => this.errorHandler.handler(err),
        });
      });
  }
}
