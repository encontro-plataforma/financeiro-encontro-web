import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

import { MaterialGlobalModule } from '../../modules/material.imports.module';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { LancamentoPickerDialogComponent } from '../lancamento-picker-dialog/lancamento-picker-dialog.component';
import { ToastService } from '../toast/toast.service';
import { ErrorHandlerService } from '../../services/error-handler.service';
import { DetalhamentoService } from '../../../services/detalhamento.service';
import { Lancamento } from '../../../models/lancamento.model';

@Component({
  selector: 'app-vinculo-lancamento',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule],
  templateUrl: './vinculo-lancamento.component.html',
  styleUrl: './vinculo-lancamento.component.scss',
})
export class VinculoLancamentoComponent {
  /** 'INSCRICAO_ENCONTREIRO' | 'INSCRICAO_ENCONTRISTA' */
  @Input() tipo!: string;
  @Input() referenciaId!: number;
  @Input() valorPagamento: number | null = null;
  @Input() detalhamentoId: number | null = null;
  @Input() lancamentoVinculado: Lancamento | null = null;

  /** Emitido após ligar/trocar/remover com sucesso — o pai deve recarregar o registro. */
  @Output() vinculado = new EventEmitter<void>();

  private dialog              = inject(MatDialog);
  private detalhamentoService = inject(DetalhamentoService);
  private toast                = inject(ToastService);
  private errorHandler         = inject(ErrorHandlerService);

  processando = false;

  ligar(): void {
    if (!this.valorPagamento) {
      this.toast.warning({ message: 'Esta inscrição não tem valor de pagamento definido.' });
      return;
    }

    this.abrirPicker((lancamento) => {
      this.processando = true;
      this.detalhamentoService.criar({
        lancamento_id: lancamento.id,
        tipo: this.tipo,
        referencia_id: this.referenciaId,
        valor: this.valorPagamento as number,
      }).subscribe({
        next: () => {
          this.processando = false;
          this.toast.success({ message: 'Lançamento vinculado com sucesso.' });
          this.vinculado.emit();
        },
        error: (err) => {
          this.processando = false;
          this.errorHandler.handler(err);
        },
      });
    });
  }

  trocar(): void {
    if (!this.detalhamentoId) return;

    this.abrirPicker((lancamento) => {
      this.processando = true;
      this.detalhamentoService.editar(this.detalhamentoId as number, { lancamento_id: lancamento.id }).subscribe({
        next: () => {
          this.processando = false;
          this.toast.success({ message: 'Lançamento alterado com sucesso.' });
          this.vinculado.emit();
        },
        error: (err) => {
          this.processando = false;
          this.errorHandler.handler(err);
        },
      });
    });
  }

  remover(): void {
    if (!this.detalhamentoId) return;

    this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title:   'Remover vínculo',
        message: 'Deseja remover o vínculo com este lançamento? A inscrição volta a ficar pendente de auditoria.',
      },
    }).afterClosed().subscribe((ok: boolean) => {
      if (!ok || !this.detalhamentoId) return;

      this.processando = true;
      this.detalhamentoService.remover(this.detalhamentoId).subscribe({
        next: () => {
          this.processando = false;
          this.toast.success({ message: 'Vínculo removido.' });
          this.vinculado.emit();
        },
        error: (err) => {
          this.processando = false;
          this.errorHandler.handler(err);
        },
      });
    });
  }

  private abrirPicker(onSelecionado: (lancamento: Lancamento) => void): void {
    this.dialog.open<LancamentoPickerDialogComponent, unknown, Lancamento>(LancamentoPickerDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
    }).afterClosed().subscribe((lancamento) => {
      if (lancamento) onSelecionado(lancamento);
    });
  }
}
