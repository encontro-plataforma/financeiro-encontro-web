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
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ErrorHandlerService } from '../../../shared/services/error-handler.service';
import { EquipeService } from '../../../services/equipe.service';
import { ListFilterBase } from '../../../shared/classes/list-filter-base';
import { Equipe } from '../../../models/equipe.model';
import { PageTemplate } from '../../../services/util/PageTemplate';
import { AcessoEquipe } from '../../../models/constants/acesso-equipe';

@Component({
  selector: 'app-equipes',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialGlobalModule, MaterialFormsModule],
  templateUrl: './equipes.component.html',
  styleUrl: './equipes.component.scss',
})
export class EquipesComponent extends ListFilterBase implements OnInit, AfterViewInit {
  private equipeService = inject(EquipeService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private toast = inject(ToastService);
  private errorHandler = inject(ErrorHandlerService);
  private cdr = inject(ChangeDetectorRef);

  result: PageTemplate<Equipe> = new PageTemplate<Equipe>();
  loading = false;
  pageIndex = 0;
  pageSize = 10;
  search = '';
  acessoFiltro = '';

  readonly AcessoEquipe = AcessoEquipe;
  readonly acessoOpcoes = AcessoEquipe.options;

  displayedColumns = ['id', 'nome', 'acesso', 'acoes'];

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.initFilter('equipes', (saved) => {
      this.search = saved.search ?? this.search;
      this.acessoFiltro = saved.acessoFiltro ?? this.acessoFiltro;
    });

    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.pageIndex = 0;
      this.saveState({ search: this.search, acessoFiltro: this.acessoFiltro });
      this.load();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.load());
  }

  onSearchChange(): void {
    this.searchSubject.next(this.search);
  }

  onAcessoChange(): void {
    this.pageIndex = 0;
    this.saveState({ search: this.search, acessoFiltro: this.acessoFiltro });
    this.load();
  }

  onPage(event: PageEvent): void {
    this.handlePage(
      event,
      () => ({ search: this.search, acessoFiltro: this.acessoFiltro }),
      () => this.load(),
    );
  }

  load(): void {
    this.loading = true;
    this.equipeService
      .list(
        {
          ...(this.search ? { nome: this.search } : {}),
          ...(this.acessoFiltro ? { acesso: this.acessoFiltro } : {}),
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
    this.router.navigate(['/secretaria/equipes/novo']);
  }

  editar(id: number): void {
    this.router.navigate(['/secretaria/equipes', id, 'editar']);
  }

  deletar(equipe: Equipe): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        data: {
          title: 'Confirmar exclusão',
          message: `Deseja excluir a equipe "${equipe.nome}"? Esta ação não pode ser desfeita.`,
        },
      })
      .afterClosed()
      .subscribe((ok: boolean) => {
        if (!ok) return;
        this.equipeService.remover(equipe.id).subscribe({
          next: () => {
            this.toast.success({ message: 'Equipe excluída com sucesso.' });
            if (this.result.items.length === 1 && this.pageIndex > 0) {
              this.pageIndex--;
            }
            this.load();
          },
          error: (err) => this.errorHandler.handler(err),
        });
      });
  }

  getAcessoLabel(acesso: string): string {
    return AcessoEquipe.getDescription(acesso);
  }
}
