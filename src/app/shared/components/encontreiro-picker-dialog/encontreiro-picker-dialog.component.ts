import { ChangeDetectorRef, Component, inject, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { MaterialGlobalModule, MaterialFormsModule } from '../../modules/material.imports.module';
import { MultiSelectComponent, MultiSelectItem } from '../multi-select/multi-select.component';
import { EncontreiroService } from '../../../services/encontreiro.service';
import { EquipeService } from '../../../services/equipe.service';
import { Encontreiro } from '../../../models/encontreiro.model';
import { PageTemplate } from '../../../services/util/PageTemplate';
import { ListFilterBase } from '../../classes/list-filter-base';

@Component({
  selector: 'app-encontreiro-picker-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialGlobalModule,
    MaterialFormsModule,
    MultiSelectComponent,
  ],
  templateUrl: './encontreiro-picker-dialog.component.html',
  styleUrl: './encontreiro-picker-dialog.component.scss',
})
export class EncontreiroPickerDialogComponent extends ListFilterBase implements AfterViewInit {
  private encontreiroService = inject(EncontreiroService);
  private equipeService = inject(EquipeService);
  private cdr = inject(ChangeDetectorRef);
  private dialogRef = inject(MatDialogRef<EncontreiroPickerDialogComponent, Encontreiro>);

  result: PageTemplate<Encontreiro> = new PageTemplate<Encontreiro>();
  loading = false;
  search = '';
  equipeSelecionadas: number[] = [];
  equipeItems: MultiSelectItem[] = [];

  displayedColumns = ['id', 'nome', 'apelido', 'equipe'];

  private searchSubject = new Subject<string>();

  constructor() {
    super();

    this.pageSize = 10;
    this.searchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
      this.pageIndex = 0;
      this.load();
    });

    this.equipeService.listAll().subscribe((equipes) => {
      this.equipeItems = equipes.map((e) => ({ id: e.id, label: e.nome }));
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

  onPage(event: PageEvent): void {
    this.handlePage(event, undefined, () => this.load());
  }

  load(): void {
    this.loading = true;
    this.encontreiroService
      .list(
        {
          ...(this.search ? { nome_ou_apelido: this.search } : {}),
          ...(this.equipeSelecionadas.length ? { equipe_ids: this.equipeSelecionadas } : {}),
        },
        {
          skip: this.pageIndex * this.pageSize,
          limit: this.pageSize,
          sort: ['nome:asc'],
        },
      )
      .subscribe({
        next: (data) => {
          this.result = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  selecionar(encontreiro: Encontreiro): void {
    this.dialogRef.close(encontreiro);
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
