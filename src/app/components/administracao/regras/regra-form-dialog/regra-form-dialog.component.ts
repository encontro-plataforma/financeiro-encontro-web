import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MaterialGlobalModule, MaterialFormsModule } from '../../../../shared/modules/material.imports.module';
import { Regra } from '../../../../models/regra-grupo.model';
import { TipoDetalhamento } from '../../../../models/constants/tipo-detalhamento';
import { ModoExtracaoRegra } from '../../../../models/constants/modo-extracao-regra';

export interface RegraFormDialogData {
  modo: 'criar' | 'editar';
  regra?: Regra;
}

export interface RegraFormDialogResult {
  nome: string;
  tipo_detalhamento_resultado: string;
  modo_extracao: 'TOKEN_VALOR' | 'NOME_NA_LISTA';
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
  readonly modoOptions = ModoExtracaoRegra.options;

  nome: string;
  tipoDetalhamentoResultado: string;
  modoExtracao: 'TOKEN_VALOR' | 'NOME_NA_LISTA';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: RegraFormDialogData,
    private dialogRef: MatDialogRef<RegraFormDialogComponent, RegraFormDialogResult | false>,
  ) {
    this.nome = data.regra?.nome ?? '';
    this.tipoDetalhamentoResultado = data.regra?.tipo_detalhamento_resultado ?? TipoDetalhamento.OUTRO;
    this.modoExtracao = data.regra?.modo_extracao ?? 'TOKEN_VALOR';
  }

  get titulo(): string {
    return this.data.modo === 'criar' ? 'Nova regra' : 'Editar regra';
  }

  get ehNomeNaLista(): boolean {
    return this.modoExtracao === ModoExtracaoRegra.NOME_NA_LISTA;
  }

  confirmar(): void {
    if (!this.nome.trim()) return;

    this.dialogRef.close({
      nome: this.nome.trim(),
      tipo_detalhamento_resultado: this.tipoDetalhamentoResultado,
      modo_extracao: this.modoExtracao,
    });
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
