import { ChangeDetectorRef, Component, inject } from '@angular/core';

import { MaterialGlobalModule } from '../../../shared/modules/material.imports.module';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { RelatorioSecretariaService } from '../../../services/relatorio-secretaria.service';

@Component({
  selector: 'app-secretaria-relatorios',
  standalone: true,
  imports: [MaterialGlobalModule],
  templateUrl: './relatorios.component.html',
  styleUrl: './relatorios.component.scss',
})
export class SecretariaRelatoriosComponent {
  private relatorioService = inject(RelatorioSecretariaService);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  gerandoEncontristasPorCirculo = false;
  gerandoComorbidades = false;

  gerarEncontristasPorCirculo(): void {
    this.gerandoEncontristasPorCirculo = true;
    this.relatorioService.gerarEncontristasPorCirculo().subscribe({
      next: (blob) => {
        this.gerandoEncontristasPorCirculo = false;
        this._download(blob, 'encontristas-por-circulo.pdf');
      },
      error: () => {
        this.toast.error({ message: 'Erro ao gerar o relatório.' });
        this.gerandoEncontristasPorCirculo = false;
        this.cdr.detectChanges();
      },
    });
  }

  gerarComorbidades(): void {
    this.gerandoComorbidades = true;
    this.relatorioService.gerarComorbidades().subscribe({
      next: (blob) => {
        this.gerandoComorbidades = false;
        this._download(blob, 'comorbidades.pdf');
      },
      error: () => {
        this.toast.error({ message: 'Erro ao gerar o relatório.' });
        this.gerandoComorbidades = false;
        this.cdr.detectChanges();
      },
    });
  }

  private _download(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 500);
  }
}
