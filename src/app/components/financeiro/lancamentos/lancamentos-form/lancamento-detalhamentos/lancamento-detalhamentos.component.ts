import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { MaterialGlobalModule } from '../../../../../shared/modules/material.imports.module';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../../../shared/components/toast/toast.service';
import { ErrorHandlerService } from '../../../../../shared/services/error-handler.service';
import { DetalhamentoService } from '../../../../../services/detalhamento.service';
import { Detalhamento } from '../../../../../models/detalhamento.model';
import {
  DetalhamentoPickerDialogComponent,
  DetalhamentoPickerDialogData,
} from '../detalhamento-picker-dialog/detalhamento-picker-dialog.component';

const ROTA_POR_TIPO: Record<string, string> = {
  INSCRICAO_ENCONTREIRO: '/secretaria/encontreiros',
  INSCRICAO_ENCONTRISTA: '/secretaria/encontristas',
};

const LABEL_POR_TIPO: Record<string, string> = {
  INSCRICAO_ENCONTREIRO: 'Inscrição Encontreiro',
  INSCRICAO_ENCONTRISTA: 'Inscrição Encontrista',
  OFERTA: 'Oferta',
  OUTRO: 'Outro',
};

@Component({
  selector: 'app-lancamento-detalhamentos',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule],
  templateUrl: './lancamento-detalhamentos.component.html',
  styleUrl: './lancamento-detalhamentos.component.scss',
})
export class LancamentoDetalhamentosComponent implements OnChanges {
  @Input() lancamentoId!: number;

  private detalhamentoService = inject(DetalhamentoService);
  private dialog                = inject(MatDialog);
  private router                = inject(Router);
  private toast                  = inject(ToastService);
  private errorHandler           = inject(ErrorHandlerService);
  private cdr                     = inject(ChangeDetectorRef);

  detalhamentos: Detalhamento[] = [];
  loading = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lancamentoId'] && this.lancamentoId) {
      this.load();
    }
  }

  load(): void {
    this.loading = true;
    this.detalhamentoService.listAll({ lancamento_id: this.lancamentoId }).subscribe({
      next: (data) => {
        this.detalhamentos = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  incluir(): void {
    this.dialog.open<DetalhamentoPickerDialogComponent, DetalhamentoPickerDialogData, boolean>(
      DetalhamentoPickerDialogComponent,
      {
        width: '800px',
        maxWidth: '95vw',
        data: { lancamentoId: this.lancamentoId },
      },
    ).afterClosed().subscribe((criado) => {
      if (criado) this.load();
    });
  }

  isInscricao(tipo: string): boolean {
    return tipo === 'INSCRICAO_ENCONTREIRO' || tipo === 'INSCRICAO_ENCONTRISTA';
  }

  irPara(det: Detalhamento): void {
    const rota = ROTA_POR_TIPO[det.tipo];
    if (!rota || det.referencia_id == null) return;

    this.router.navigate([rota, det.referencia_id, 'editar'], {
      state: { returnUrl: this.router.url },
    });
  }

  excluir(det: Detalhamento): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '440px',
      data: {
        title:   'Remover detalhamento',
        message: `Deseja remover o detalhamento "${this.tipoLabel(det.tipo)} — ${det.detalhe_nome}"? ` +
                  (this.isInscricao(det.tipo) ? 'A inscrição volta a ficar pendente de auditoria.' : 'Esta ação não pode ser desfeita.'),
      },
    }).afterClosed().subscribe((ok: boolean) => {
      if (!ok) return;
      this.detalhamentoService.remover(det.id).subscribe({
        next: () => {
          this.toast.success({ message: 'Detalhamento removido com sucesso.' });
          this.load();
        },
        error: (err) => this.errorHandler.handler(err),
      });
    });
  }

  tipoLabel(tipo: string): string {
    return LABEL_POR_TIPO[tipo] ?? tipo;
  }
}
