import { Component, inject, OnInit, AfterViewInit, ChangeDetectorRef, ViewEncapsulation } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import {
  MaterialGlobalModule,
  MaterialFormsModule,
} from '../../shared/modules/material.imports.module';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../shared/components/toast/toast.service';
import { ExtratoBancarioService } from '../../services/extrato-bancario.service';
import { ExtratoBancario } from '../../models/extrato-bancario.model';
import { PageTemplate } from '../../services/util/PageTemplate';

@Component({
  selector: 'app-arquivos',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, MaterialGlobalModule, MaterialFormsModule],
  templateUrl: './arquivos.component.html',
  styleUrl:    './arquivos.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ArquivosComponent implements OnInit, AfterViewInit {
  private extratoService = inject(ExtratoBancarioService);
  private dialog         = inject(MatDialog);
  private toast          = inject(ToastService);
  private cdr            = inject(ChangeDetectorRef);

  result: PageTemplate<ExtratoBancario> = new PageTemplate<ExtratoBancario>();
  loading       = false;
  pageIndex     = 0;
  pageSize      = 10;
  search        = '';
  downloading   = new Set<number>();

  displayedColumns = ['processado_em', 'nome_arquivo', 'tamanho', 'acoes'];

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
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
    this.extratoService
      .list(
        { ...(this.search ? { nome_arquivo: this.search } : {}) },
        { skip: this.pageIndex * this.pageSize, limit: this.pageSize },
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

  download(extrato: ExtratoBancario): void {
    this.downloading.add(extrato.id);
    this.extratoService.download(extrato.id).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href     = url;
        a.download = extrato.nome_arquivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        this.downloading.delete(extrato.id);
      },
      error: () => {
        this.downloading.delete(extrato.id);
        this.toast.error({ message: 'Erro ao fazer download do arquivo.' });
      },
    });
  }

  deletar(extrato: ExtratoBancario): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title:   'Confirmar exclusão',
        message: `Deseja excluir o arquivo "${extrato.nome_arquivo}"? Esta ação não pode ser desfeita.`,
      },
    }).afterClosed().subscribe((ok: boolean) => {
      if (!ok) return;
      this.extratoService.remover(extrato.id).subscribe({
        next: () => {
          this.toast.success({ message: 'Arquivo excluído com sucesso.' });
          if (this.result.items.length === 1 && this.pageIndex > 0) {
            this.pageIndex--;
          }
          this.load();
        },
        error: (err) => this.toast.error({ message: err?.error?.detail ?? 'Erro ao excluir arquivo.' }),
      });
    });
  }

  formatBytes(bytes: number | null): string {
    if (bytes == null) return '—';
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  isDownloading(id: number): boolean {
    return this.downloading.has(id);
  }
}
