import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialGlobalModule } from '../../../shared/modules/material.imports.module';
import { RegraService } from '../../../services/regra.service';
import { RegraGrupo } from '../../../models/regra-grupo.model';
import { RegraGrupoCardComponent } from './regra-grupo-card/regra-grupo-card.component';

@Component({
  selector: 'app-regras',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule, RegraGrupoCardComponent],
  templateUrl: './regras.component.html',
  styleUrl: './regras.component.scss',
})
export class RegrasComponent implements OnInit {
  private regraService = inject(RegraService);
  private cdr = inject(ChangeDetectorRef);

  grupos: RegraGrupo[] = [];
  loading = false;

  ngOnInit(): void {
    this.loading = true;
    this.regraService.listAll().subscribe({
      next: (data) => {
        this.grupos = [...data].sort((a, b) => a.ordem - b.ordem);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onSalvo(grupoAtualizado: RegraGrupo): void {
    const index = this.grupos.findIndex((g) => g.id === grupoAtualizado.id);
    if (index >= 0) {
      this.grupos = [
        ...this.grupos.slice(0, index),
        grupoAtualizado,
        ...this.grupos.slice(index + 1),
      ];
    }
  }
}
