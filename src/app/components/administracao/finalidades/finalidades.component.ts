import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  AfterViewInit,
  ViewEncapsulation,
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
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { FinalidadeService } from '../../../services/finalidade.service';
import { Finalidade } from '../../../models/finalidade.model';
import { ListFilterBase } from '../../../shared/classes/list-filter-base';
import { PageTemplate } from '../../../services/util/PageTemplate';
import { TipoLancamento } from '../../../models/constants/tipo-lancamento';

@Component({
  selector: 'app-finalidades',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, MaterialGlobalModule, MaterialFormsModule],
  templateUrl: './finalidades.component.html',
  styleUrl: './finalidades.component.scss',
})
export class FinalidadesComponent extends ListFilterBase implements OnInit, AfterViewInit {
  private finalidadeService = inject(FinalidadeService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private toast = inject(ToastService);
  private errorHandler = inject(ErrorHandlerService);
  private cdr = inject(ChangeDetectorRef);

  result: PageTemplate<Finalidade> = new PageTemplate<Finalidade>();
  loading = false;
  pageIndex = 0;
  pageSize = 10;
  search = '';
  tipoFiltro = '';

  readonly TipoLancamento = TipoLancamento;
  readonly tipoOpcoes = TipoLancamento.options;

  displayedColumns = ['tipo', 'nome', 'descricao', 'acoes'];

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    // restore saved filters
    this.initFilter('finalidades', (saved) => {
      this.search = saved.search ?? this.search;
      this.tipoFiltro = saved.tipoFiltro ?? this.tipoFiltro;
    });

    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.pageIndex = 0;
      this.saveState({ search: this.search, tipoFiltro: this.tipoFiltro });
      this.load();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.load());
  }

  onSearchChange(): void {
    this.searchSubject.next(this.search);
  }

  onTipoChange(): void {
    this.pageIndex = 0;
    this.saveState({ search: this.search, tipoFiltro: this.tipoFiltro });
    this.load();
  }

  onPage(event: PageEvent): void {
    this.handlePage(
      event,
      () => ({ search: this.search, tipoFiltro: this.tipoFiltro }),
      () => this.load(),
    );
  }

  load(): void {
    this.loading = true;
    this.finalidadeService
      .list(
        {
          ...(this.search ? { nome: this.search } : {}),
          ...(this.tipoFiltro ? { tipo: this.tipoFiltro } : {}),
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

  criar(): void {
    this.router.navigate(['/administracao/finalidades/novo']);
  }

  editar(id: number): void {
    this.router.navigate(['/administracao/finalidades', id, 'editar']);
  }

  deletar(finalidade: Finalidade): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        data: {
          title: 'Confirmar exclusão',
          message: `Deseja excluir a finalidade "${finalidade.nome}"? Esta ação não pode ser desfeita.`,
        },
      })
      .afterClosed()
      .subscribe((ok: boolean) => {
        if (!ok) return;
        this.finalidadeService.remover(finalidade.id).subscribe({
          next: () => {
            this.toast.success({ message: 'Finalidade excluída com sucesso.' });
            if (this.result.items.length === 1 && this.pageIndex > 0) {
              this.pageIndex--;
            }
            this.load();
          },
          error: (err) => this.errorHandler.handler(err),
        });
      });
  }

  getTipoClass(tipo: string): string {
    return tipo === TipoLancamento.RECEITA ? 'chip-receita' : 'chip-despesa';
  }

  getTipoLabel(tipo: string): string {
    return tipo === TipoLancamento.RECEITA ? 'Receita' : 'Despesa';
  }
}
