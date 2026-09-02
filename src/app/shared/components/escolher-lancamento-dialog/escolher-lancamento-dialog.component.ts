import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialGlobalModule } from '../../modules/material.imports.module';
import { Detalhamento } from '../../../models/detalhamento.model';

export interface EscolherLancamentoDialogData {
  vinculos: Detalhamento[];
}

/** Diálogo simples de escolha, usado na listagem de Encontreiros/Encontristas
 * quando a pessoa tem mais de um lançamento vinculado — o clique único do
 * botão "ver lançamento" não é suficiente pra saber qual deles abrir. */
@Component({
  selector: 'app-escolher-lancamento-dialog',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule],
  template: `
    <h2 mat-dialog-title>Escolher lançamento</h2>

    <mat-dialog-content class="escolha-content">
      @for (vinculo of data.vinculos; track vinculo.id) {
        <button mat-stroked-button class="escolha-item" (click)="escolher(vinculo.lancamento_id)">
          <span class="escolha-item__titulo">{{
            vinculo.lancamento?.descricao ?? ('Lançamento #' + vinculo.lancamento_id)
          }}</span>
          <span class="escolha-item__linha2">
            {{ vinculo.valor | currency: 'BRL' }}
            @if (vinculo.lancamento?.data_pagamento; as dataPagamento) {
              &nbsp;·&nbsp;{{ dataPagamento | date: 'dd/MM/yyyy' }}
            }
          </span>
        </button>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancelar()">Cancelar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .escolha-content {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 320px;
    }
    .escolha-item {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      height: auto;
      padding: 8px 16px;
      text-align: left;
      line-height: 1.3;
    }
    .escolha-item__titulo {
      font-weight: 500;
    }
    .escolha-item__linha2 {
      font-size: 0.8rem;
      color: var(--mat-sys-on-surface-variant);
    }
  `],
})
export class EscolherLancamentoDialogComponent {
  data: EscolherLancamentoDialogData = inject(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<EscolherLancamentoDialogComponent, number>);

  escolher(lancamentoId: number): void {
    this.ref.close(lancamentoId);
  }

  cancelar(): void {
    this.ref.close();
  }
}
