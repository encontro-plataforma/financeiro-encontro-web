import { ChangeDetectorRef, Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Sort, SortDirection } from '@angular/material/sort';
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
import { CirculoPickerDialogComponent } from '../../../shared/components/circulo-picker-dialog/circulo-picker-dialog.component';
import { TelefoneBrPipe } from '../../../shared/pipes/telefone-br.pipe';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { EncontristaService } from '../../../services/encontrista.service';
import { CirculoService } from '../../../services/circulo.service';
import { ListFilterBase } from '../../../shared/classes/list-filter-base';
import { Encontrista, PadrinhoResumo } from '../../../models/encontrista.model';
import { Circulo } from '../../../models/circulo.model';
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
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  result: PageTemplate<Encontrista> = new PageTemplate<Encontrista>();
  loading = false;

  search = '';
  circuloSelecionados: number[] = [];
  padrinhoFiltro = '';
  auditadoFiltro = AUDITADO_TODOS;
  sortField = 'id';
  sortDirection: SortDirection = 'asc';

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
        sortField: this.sortField,
        sortDirection: this.sortDirection,
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
      this.sortField = saved.sortField ?? this.sortField;
      this.sortDirection = saved.sortDirection ?? this.sortDirection;
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
      sortField: this.sortField,
      sortDirection: this.sortDirection,
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
      sortField: this.sortField,
      sortDirection: this.sortDirection,
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
      sortField: this.sortField,
      sortDirection: this.sortDirection,
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
        sortField: this.sortField,
        sortDirection: this.sortDirection,
      }),
      () => this.load(),
    );
  }

  onSortChange(sort: Sort): void {
    this.sortField = sort.active;
    this.sortDirection = sort.direction;
    this.pageIndex = 0;
    this.saveState({
      search: this.search,
      circuloSelecionados: this.circuloSelecionados,
      padrinhoFiltro: this.padrinhoFiltro,
      auditadoFiltro: this.auditadoFiltro,
      sortField: this.sortField,
      sortDirection: this.sortDirection,
    });
    this.load();
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
        {
          skip: this.pageIndex * this.pageSize,
          limit: this.pageSize,
          ...(this.sortDirection ? { sort: [`${this.sortField}:${this.sortDirection}`] } : {}),
        },
      )
      .subscribe({
        next: (data) => {
          if (data.items.length === 0 && this.pageIndex > 0) {
            this.pageIndex = 0;
            this.load();
            return;
          }
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

  private static readonly CONECTORES_NOME = ['de', 'da'];

  primeiroSegundoNome(nome: string): string {
    const palavras = nome.trim().split(/\s+/);
    const resultado = [palavras[0]];

    if (palavras.length > 1) {
      const segunda = palavras[1];
      resultado.push(segunda);
      if (EncontristasComponent.CONECTORES_NOME.includes(segunda.toLowerCase()) && palavras.length > 2) {
        resultado.push(palavras[2]);
      }
    }

    return resultado.join(' ');
  }

  abrirCirculoPicker(row: Encontrista): void {
    this.dialog
      .open<CirculoPickerDialogComponent, unknown, Circulo>(CirculoPickerDialogComponent, {
        width: '480px',
        maxWidth: '95vw',
        data: { circuloAtualId: row.circulo_id },
      })
      .afterClosed()
      .subscribe((circulo) => {
        if (!circulo) return;

        const novoCirculoId = circulo.id === SEM_CIRCULO_ID ? null : circulo.id;
        if (novoCirculoId === row.circulo_id) return;

        this.encontristaService.alterarCirculo(row.id, circulo.id).subscribe({
          next: () => {
            this.toast.success({ message: 'Círculo atualizado com sucesso.' });
            this.load();
          },
          error: (err) => this.errorHandler.handler(err),
        });
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
