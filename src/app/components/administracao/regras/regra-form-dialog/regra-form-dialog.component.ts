import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MaterialGlobalModule, MaterialFormsModule } from '../../../../shared/modules/material.imports.module';
import { Regra } from '../../../../models/regra-grupo.model';
import { TipoDetalhamento } from '../../../../models/constants/tipo-detalhamento';

export interface RegraFormDialogData {
  modo: 'criar' | 'editar';
  regra?: Regra;
  /** Se a regra já tem alguma condição — controla se dá pra ativar. */
  temCondicoes: boolean;
}

export interface RegraFormDialogResult {
  nome: string;
  tipo_detalhamento_resultado: string;
  ativo: boolean;
}

@Component({
  selector: 'app-regra-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialGlobalModule, MaterialFormsModule],
  templateUrl: './regra-form-dialog.component.html',
  styleUrl: './regra-form-dialog.component.scss',
})
export class RegraFormDialogComponent {
  readonly tipoOptions = TipoDetalhamento.options;

  nome: string;
  tipoDetalhamentoResultado: string;
  ativo: boolean;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: RegraFormDialogData,
    private dialogRef: MatDialogRef<RegraFormDialogComponent, RegraFormDialogResult | false>,
  ) {
    this.nome = data.regra?.nome ?? '';
    this.tipoDetalhamentoResultado = data.regra?.tipo_detalhamento_resultado ?? TipoDetalhamento.OUTRO;
    this.ativo = data.regra?.ativo ?? false;
  }

  get titulo(): string {
    return this.data.modo === 'criar' ? 'Nova regra' : 'Editar regra';
  }

  confirmar(): void {
    if (!this.nome.trim()) return;

    this.dialogRef.close({
      nome: this.nome.trim(),
      tipo_detalhamento_resultado: this.tipoDetalhamentoResultado,
      // Uma regra recém-criada nunca tem condição ainda, então nasce sempre
      // desativada — o toggle só existe (e só importa) no modo editar.
      ativo: this.data.modo === 'editar' ? this.ativo : false,
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
