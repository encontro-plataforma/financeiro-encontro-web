import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import moment from 'moment';

import {
  MaterialGlobalModule,
  MaterialFormsModule,
  MaterialDatepickerModule,
} from '../../../shared/modules/material.imports.module';
import { ToastService }     from '../../../shared/components/toast/toast.service';
import { RelatorioService } from '../../../services/relatorio.service';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule, MaterialFormsModule, MaterialDatepickerModule],
  templateUrl: './relatorios.component.html',
  styleUrl: './relatorios.component.scss',
})
export class RelatoriosComponent {
  private fb              = inject(FormBuilder);
  private relatorioService = inject(RelatorioService);
  private toast           = inject(ToastService);

  gerandoLivroCaixa  = false;
  gerandoResumoGeral = false;

  formLivroCaixa: FormGroup = this.fb.group({
    data_inicio: [moment().startOf('month'), Validators.required],
    data_fim:    [moment(),                  Validators.required],
  });

  formResumoGeral: FormGroup = this.fb.group({
    data_inicio: [moment().startOf('month'), Validators.required],
    data_fim:    [moment(),                  Validators.required],
  });

  gerarLivroCaixa(): void {
    if (this.formLivroCaixa.invalid) return;

    const { data_inicio, data_fim } = this.formLivroCaixa.value;
    const inicio = moment(data_inicio).format('YYYY-MM-DD');
    const fim    = moment(data_fim).format('YYYY-MM-DD');

    this.gerandoLivroCaixa = true;
    this.relatorioService.gerarLivroCaixa(inicio, fim).subscribe({
      next: (blob) => {
        this._download(blob, `livro-caixa-${inicio}-${fim}.pdf`);
        this.gerandoLivroCaixa = false;
      },
      error: () => {
        this.toast.error({ message: 'Erro ao gerar o relatório.' });
        this.gerandoLivroCaixa = false;
      },
    });
  }

  gerarResumoGeral(): void {
    if (this.formResumoGeral.invalid) return;

    const { data_inicio, data_fim } = this.formResumoGeral.value;
    const inicio = moment(data_inicio).format('YYYY-MM-DD');
    const fim    = moment(data_fim).format('YYYY-MM-DD');

    this.gerandoResumoGeral = true;
    this.relatorioService.gerarResumoGeral(inicio, fim).subscribe({
      next: (blob) => {
        this._download(blob, `resumo-geral-${inicio}-${fim}.pdf`);
        this.gerandoResumoGeral = false;
      },
      error: () => {
        this.toast.error({ message: 'Erro ao gerar o relatório.' });
        this.gerandoResumoGeral = false;
      },
    });
  }

  private _download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
