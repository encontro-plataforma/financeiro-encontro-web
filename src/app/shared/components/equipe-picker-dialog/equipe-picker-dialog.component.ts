import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MaterialGlobalModule } from '../../modules/material.imports.module';
import { EquipeService } from '../../../services/equipe.service';
import { Equipe } from '../../../models/equipe.model';
import { AcessoEquipe } from '../../../models/constants/acesso-equipe';

export interface EquipePickerDialogData {
  equipeAtualId?: number | null;
}

interface AcessoGrupo {
  acesso: string;
  label: string;
  slug: string;
  equipes: Equipe[];
}

// Ordem fixa dos grupos no dialog -- N/A (cancelado) sempre por último.
const ORDEM_ACESSO = [
  AcessoEquipe.EDG,
  AcessoEquipe.VERDE,
  AcessoEquipe.AMARELO,
  AcessoEquipe.VERMELHO,
  AcessoEquipe.NA,
];

// Slug usado nas custom properties CSS --acesso-<slug>-bg / --acesso-<slug>-text
// (ver src/styles/abstracts/_colors.scss).
const ACESSO_SLUG: Record<string, string> = {
  [AcessoEquipe.EDG]: 'edg',
  [AcessoEquipe.VERDE]: 'verde',
  [AcessoEquipe.AMARELO]: 'amarelo',
  [AcessoEquipe.VERMELHO]: 'vermelho',
  [AcessoEquipe.NA]: 'na',
};

export function acessoCorFundo(acesso: string | undefined | null): string | null {
  if (!acesso) return null;
  const slug = ACESSO_SLUG[acesso];
  return slug ? `var(--acesso-${slug}-bg)` : null;
}

@Component({
  selector: 'app-equipe-picker-dialog',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule],
  templateUrl: './equipe-picker-dialog.component.html',
  styleUrl: './equipe-picker-dialog.component.scss',
})
export class EquipePickerDialogComponent implements OnInit {
  private equipeService = inject(EquipeService);
  private dialogRef = inject(MatDialogRef<EquipePickerDialogComponent, Equipe>);
  data: EquipePickerDialogData = inject(MAT_DIALOG_DATA, { optional: true }) ?? {};
  cdr = inject(ChangeDetectorRef);

  loading = false;
  grupos: AcessoGrupo[] = [];

  ngOnInit(): void {
    this.loading = true;
    this.equipeService.listAll().subscribe({
      next: (equipes) => {
        this.grupos = ORDEM_ACESSO.map((acesso) => ({
          acesso,
          label: AcessoEquipe.getDescription(acesso),
          slug: ACESSO_SLUG[acesso],
          equipes: equipes
            .filter((e) => e.acesso === acesso)
            .sort((a, b) => a.nome.localeCompare(b.nome)),
        })).filter((grupo) => grupo.equipes.length > 0);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  selecionar(equipe: Equipe): void {
    this.dialogRef.close(equipe);
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
