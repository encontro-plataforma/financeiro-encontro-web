import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  AfterViewInit,
} from '@angular/core';
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
import { MultiSelectComponent, MultiSelectItem } from '../../../shared/components/multi-select/multi-select.component';
import { CsvUploadDialogComponent } from '../../../shared/components/csv-upload-dialog/csv-upload-dialog.component';
import { TelefoneBrPipe } from '../../../shared/pipes/telefone-br.pipe';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { EncontreiroService } from '../../../services/encontreiro.service';
import { EquipeService } from '../../../services/equipe.service';
import { Encontreiro } from '../../../models/encontreiro.model';
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
export class EncontreirosComponent implements OnInit, AfterViewInit {
  private encontreiroService = inject(EncontreiroService);
  private equipeService      = inject(EquipeService);
  private router              = inject(Router);
  private dialog               = inject(MatDialog);
  private errorHandler         = inject(ErrorHandlerService);
  private cdr                   = inject(ChangeDetectorRef);

  result: PageTemplate<Encontreiro> = new PageTemplate<Encontreiro>();
  loading   = false;
  pageIndex = 0;
  pageSize  = 10;

  search             = '';
  equipeSelecionadas: number[] = [];
  situacaoSelecionadas: string[] = [];
  auditadoFiltro     = AUDITADO_TODOS;

  equipeItems: MultiSelectItem[] = [];
  readonly situacaoItems: MultiSelectItem[] = SituacaoCamisa.options.map(op => ({ id: op.value, label: op.name }));

  readonly auditadoOpcoes = [
    { name: 'Todos', value: AUDITADO_TODOS },
    { name: 'Sim',   value: 'true' },
    { name: 'Não',   value: 'false' },
  ];

  displayedColumns = ['id', 'dt_inscricao', 'detalhes', 'equipe', 'camisa', 'situacao_camisa', 'acoes'];

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(() => {
      this.pageIndex = 0;
      this.load();
    });

    this.equipeService.listAll().subscribe((equipes) => {
      this.equipeItems = equipes.map(e => ({ id: e.id, label: e.nome }));
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.load());
  }

  onSearchChange(): void {
    this.searchSubject.next(this.search);
  }

  onEquipeChange(ids: (string | number)[]): void {
    this.equipeSelecionadas = ids as number[];
    this.pageIndex = 0;
    this.load();
  }

  onSituacaoChange(ids: (string | number)[]): void {
    this.situacaoSelecionadas = ids as string[];
    this.pageIndex = 0;
    this.load();
  }

  onAuditadoChange(): void {
    this.pageIndex = 0;
    this.load();
  }

  onPage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize  = event.pageSize;
    this.load();
  }

  load(): void {
    this.loading = true;
    this.encontreiroService
      .list(
        {
          ...(this.search ? { nome_ou_apelido: this.search } : {}),
          ...(this.equipeSelecionadas.length ? { equipe_ids: this.equipeSelecionadas } : {}),
          ...(this.situacaoSelecionadas.length ? { situacao_camisa: this.situacaoSelecionadas } : {}),
          ...(this.auditadoFiltro !== AUDITADO_TODOS ? { auditado: this.auditadoFiltro === 'true' } : {}),
        },
        { skip: this.pageIndex * this.pageSize, limit: this.pageSize },
      )
      .subscribe({
        next: (data) => {
          this.result  = data;
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

  verLancamento(lancamentoId: number): void {
    this.router.navigate(['/lancamentos', lancamentoId, 'editar'], {
      state: { returnUrl: this.router.url },
    });
  }

  enviarCsv(): void {
    CsvUploadDialogComponent.open(this.dialog, {
      titulo:   'Importar Encontreiros',
      endpoint: '/encontreiros/conciliacao',
    }).afterClosed().subscribe(() => this.load());
  }

  getSituacaoLabel(situacao: string): string {
    return SituacaoCamisa.getDescription(situacao);
  }
}
