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
import { TelefoneBrPipe } from '../../../shared/pipes/telefone-br.pipe';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { EncontristaService } from '../../../services/encontrista.service';
import { CirculoService } from '../../../services/circulo.service';
import { ListFilterBase } from '../../../shared/classes/list-filter-base';
import { Encontrista, PadrinhoResumo } from '../../../models/encontrista.model';
import { PageTemplate } from '../../../services/util/PageTemplate';

const AUDITADO_TODOS = '-1';
const SEM_CIRCULO_ID = 0;

@Component({
  selector: 'app-encontristas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialGlobalModule,
    MaterialFormsModule,
    MultiSelectComponent,
    TelefoneBrPipe,
  ],
  templateUrl: './encontristas.component.html',
  styleUrl: './encontristas.component.scss',
})
export class EncontristasComponent extends ListFilterBase implements OnInit, AfterViewInit {
  private encontristaService = inject(EncontristaService);
  private circuloService = inject(CirculoService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private errorHandler = inject(ErrorHandlerService);
  private cdr = inject(ChangeDetectorRef);

  result: PageTemplate<Encontrista> = new PageTemplate<Encontrista>();
  loading = false;
  pageIndex = 0;
  pageSize = 10;

  search = '';
  circuloSelecionados: number[] = [];
  padrinhoFiltro = '';
  auditadoFiltro = AUDITADO_TODOS;

  circuloItems: MultiSelectItem[] = [];
  padrinhos: PadrinhoResumo[] = [];

  readonly auditadoOpcoes = [
    { name: 'Todos', value: AUDITADO_TODOS },
    { name: 'Sim', value: 'true' },
    { name: 'Não', value: 'false' },
  ];

  displayedColumns = [
    'id',
    'dt_entrega',
    'detalhes',
    'circulo',
    'idade',
    'padrinho',
    'carta',
    'album',
    'camisa',
    'acoes',
  ];

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.pageIndex = 0;
      this.saveState({
        search: this.search,
        circuloSelecionados: this.circuloSelecionados,
        padrinhoFiltro: this.padrinhoFiltro,
        auditadoFiltro: this.auditadoFiltro,
      });
      this.load();
    });

    this.circuloService.listAll().subscribe((circulos) => {
      this.circuloItems = [
        { id: SEM_CIRCULO_ID, label: 'Sem Círculo' },
        ...circulos.map((c) => ({ id: c.id, label: c.nome })),
      ];
      this.cdr.detectChanges();
    });

    this.encontristaService.padrinhosDisponiveis().subscribe((padrinhos) => {
      this.padrinhos = padrinhos;
      this.cdr.detectChanges();
    });

    // restore state
    this.initFilter('encontristas', (saved) => {
      this.search = saved.search ?? this.search;
      this.circuloSelecionados = saved.circuloSelecionados ?? this.circuloSelecionados;
      this.padrinhoFiltro = saved.padrinhoFiltro ?? this.padrinhoFiltro;
      this.auditadoFiltro = saved.auditadoFiltro ?? this.auditadoFiltro;
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.load());
  }

  onSearchChange(): void {
    this.searchSubject.next(this.search);
  }

  onCirculoChange(ids: (string | number)[]): void {
    this.circuloSelecionados = ids as number[];
    this.pageIndex = 0;
    this.saveState({
      search: this.search,
      circuloSelecionados: this.circuloSelecionados,
      padrinhoFiltro: this.padrinhoFiltro,
      auditadoFiltro: this.auditadoFiltro,
    });
    this.load();
  }

  onPadrinhoChange(): void {
    this.pageIndex = 0;
    this.saveState({
      search: this.search,
      circuloSelecionados: this.circuloSelecionados,
      padrinhoFiltro: this.padrinhoFiltro,
      auditadoFiltro: this.auditadoFiltro,
    });
    this.load();
  }

  onAuditadoChange(): void {
    this.pageIndex = 0;
    this.saveState({
      search: this.search,
      circuloSelecionados: this.circuloSelecionados,
      padrinhoFiltro: this.padrinhoFiltro,
      auditadoFiltro: this.auditadoFiltro,
    });
    this.load();
  }

  onPage(event: PageEvent): void {
    this.handlePage(
      event,
      () => ({
        search: this.search,
        circuloSelecionados: this.circuloSelecionados,
        padrinhoFiltro: this.padrinhoFiltro,
        auditadoFiltro: this.auditadoFiltro,
      }),
      () => this.load(),
    );
  }

  load(): void {
    this.loading = true;
    this.encontristaService
      .list(
        {
          ...(this.search ? { nome_ou_apelido: this.search } : {}),
          ...(this.circuloSelecionados.length ? { circulo_ids: this.circuloSelecionados } : {}),
          ...(this.padrinhoFiltro ? { padrinho_id: Number(this.padrinhoFiltro) } : {}),
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
    this.router.navigate(['/secretaria/encontristas', id, 'editar']);
  }

  verLancamento(lancamentoId: number): void {
    this.router.navigate(['/lancamentos', lancamentoId, 'editar'], {
      state: { returnUrl: this.router.url },
    });
  }

  enviarCsv(): void {
    CsvUploadDialogComponent.open(this.dialog, {
      titulo: 'Importar Encontristas',
      endpoint: '/encontristas/conciliacao',
    })
      .afterClosed()
      .subscribe(() => this.load());
  }
}
