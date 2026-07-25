import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { MaterialGlobalModule, MaterialFormsModule } from '../../../../shared/modules/material.imports.module';
import { ConciliacaoCardComponent } from './conciliacao-card/conciliacao-card.component';
import { LancamentoService } from '../../../../services/lancamento.service';
import { FinalidadeService } from '../../../../services/finalidade.service';
import { Lancamento } from '../../../../models/lancamento.model';
import { Finalidade } from '../../../../models/finalidade.model';
import { StatusLancamento } from '../../../../models/constants/status-lancamento';

const ANIMATION_DURATION_MS = 350;
const LAZY_THRESHOLD        = 10;
const PAGE_SIZE             = 20;

interface CardItem extends Lancamento {
  _leaving: boolean;
}

@Component({
  selector: 'app-conciliar-lancamentos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialGlobalModule,
    MaterialFormsModule,
    ConciliacaoCardComponent,
  ],
  templateUrl: './conciliar-lancamentos.component.html',
  styleUrl: './conciliar-lancamentos.component.scss',
})
export class ConciliarLancamentosComponent implements OnInit, OnDestroy {
  private lancamentoService = inject(LancamentoService);
  private finalidadeService = inject(FinalidadeService);
  private router            = inject(Router);
  private cdr               = inject(ChangeDetectorRef);

  items: CardItem[]     = [];
  finalidades: Finalidade[] = [];
  loading     = false;
  loadingMore = false;
  allLoaded   = false;
  search      = '';

  private searchSubject = new Subject<string>();
  private searchSub!: Subscription;

  ngOnInit(): void {
    this.searchSub = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe(() => this.reset());

    this.finalidadeService.listAll().subscribe({
      next: (data) => {
        this.finalidades = data;
        this.loadBatch(true);
      },
      error: () => this.loadBatch(true),
    });
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.search);
  }

  voltar(): void {
    this.router.navigate(['/lancamentos']);
  }

  private reset(): void {
    this.items     = [];
    this.allLoaded = false;
    this.loadBatch(true);
  }

  loadBatch(initial = false, pageAppend = 20): void {
    if (initial) {
      this.loading = true;
    } else {
      this.loadingMore = true;
    }

    const excludeIds = this.items.map(i => i.id);

    this.lancamentoService
      .list(
        {
          status: StatusLancamento.NAO_CONCILIADO,
          exclude_ids: excludeIds,
          ...(this.search ? { descricao: this.search } : {}),
        },
        { skip: 0, limit: pageAppend },
      )
      .subscribe({
        next: (page) => {
          const newItems: CardItem[] = page.items.map(l => ({ ...l, _leaving: false }));
          this.items       = [...this.items, ...newItems];
          this.allLoaded   = page.total < PAGE_SIZE;
          this.loading     = false;
          this.loadingMore = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading     = false;
          this.loadingMore = false;
          this.cdr.detectChanges();
        },
      });
  }

  onConciliado(item: CardItem): void {
    item._leaving = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.items = this.items.filter(i => i.id !== item.id);

      if (this.visibleCount < LAZY_THRESHOLD && !this.allLoaded && !this.loadingMore) {
        this.loadBatch(false, 10);
      }
      this.cdr.detectChanges();
    }, ANIMATION_DURATION_MS);
  }

  get visibleCount(): number {
    return this.items.filter(i => !i._leaving).length;
  }

  get isEmpty(): boolean {
    return !this.loading && this.items.length === 0;
  }
}
