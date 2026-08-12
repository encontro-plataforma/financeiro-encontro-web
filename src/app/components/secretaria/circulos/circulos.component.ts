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
import { CirculoService } from '../../../services/circulo.service';
import { ListFilterBase } from '../../../shared/classes/list-filter-base';
import { Circulo } from '../../../models/circulo.model';
import { PageTemplate } from '../../../services/util/PageTemplate';

@Component({
  selector: 'app-circulos',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialGlobalModule, MaterialFormsModule],
  templateUrl: './circulos.component.html',
  styleUrl: './circulos.component.scss',
})
export class CirculosComponent extends ListFilterBase implements OnInit, AfterViewInit {
  private circuloService = inject(CirculoService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private toast = inject(ToastService);
  private errorHandler = inject(ErrorHandlerService);
  private cdr = inject(ChangeDetectorRef);

  result: PageTemplate<Circulo> = new PageTemplate<Circulo>();
  loading = false;
  search = '';

  displayedColumns = ['id', 'nome', 'rgb', 'acoes'];

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.initFilter('circulos', (saved) => {
      this.search = saved.search ?? this.search;
    });

    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.pageIndex = 0;
      this.saveState({ search: this.search });
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
    this.handlePage(
      event,
      () => ({ search: this.search }),
      () => this.load(),
    );
  }

  load(): void {
    this.loading = true;
    this.circuloService
      .list(
        { ...(this.search ? { nome: this.search } : {}) },
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
    this.router.navigate(['/secretaria/circulos/novo']);
  }

  editar(id: number): void {
    this.router.navigate(['/secretaria/circulos', id, 'editar']);
  }

  deletar(circulo: Circulo): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        data: {
          title: 'Confirmar exclusão',
          message: `Deseja excluir o círculo "${circulo.nome}"? Esta ação não pode ser desfeita.`,
        },
      })
      .afterClosed()
      .subscribe((ok: boolean) => {
        if (!ok) return;
        this.circuloService.remover(circulo.id).subscribe({
          next: () => {
            this.toast.success({ message: 'Círculo excluído com sucesso.' });
            if (this.result.items.length === 1 && this.pageIndex > 0) {
              this.pageIndex--;
            }
            this.load();
          },
          error: (err) => this.errorHandler.handler(err),
        });
      });
  }
}
