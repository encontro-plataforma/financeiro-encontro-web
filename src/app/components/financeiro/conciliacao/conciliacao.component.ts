import { ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { MaterialGlobalModule } from '../../../shared/modules/material.imports.module';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { ConciliacaoService } from '../../../services/conciliacao.service';
import {
  ConciliacaoUploadDialogComponent,
  UploadDialogData,
} from './conciliacao-upload-dialog/conciliacao-upload-dialog.component';

@Component({
  selector: 'app-conciliacao',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule],
  templateUrl: './conciliacao.component.html',
  styleUrl:    './conciliacao.component.scss',
})
export class ConciliacaoComponent {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  private cdr   = inject(ChangeDetectorRef);

  uploading = false;
  dragOver  = false;

  constructor(
    private conciliacaoService: ConciliacaoService,
    private dialog: MatDialog,
    private router: Router,
    private toast: ToastService,
  ) {}

  irParaConciliar(): void {
    this.router.navigate(['/conciliacao/conciliar']);
  }

  abrirSeletor(): void {
    this.fileInputRef.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.upload(file);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver = false;

    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    this.upload(file);
  }

  private upload(file: File): void {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.toast.warning({ message: 'Apenas arquivos .csv são aceitos.' });
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      this.toast.error({ message: 'Arquivo está acima do limite permitido de tamanho de dados (3 MB).' });
      return;
    }

    this.uploading = true;
    this.conciliacaoService.upload(file).subscribe({
      next: (resultado) => {
        this.uploading = false;
        this.abrirDialog(file.name, resultado);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.uploading = false;
        this.toast.error({ message: err?.error?.detail ?? 'Erro ao processar o arquivo.' });
        this.cdr.detectChanges();
      },
    });
  }

  private abrirDialog(nomeArquivo: string, resultado: { inseridos: number; duplicados: number; erros: number }): void {
    this.dialog.open<ConciliacaoUploadDialogComponent, UploadDialogData>(
      ConciliacaoUploadDialogComponent,
      {
        width: '440px',
        disableClose: true,
        data: {
          nomeArquivo,
          inseridos:  resultado.inseridos,
          duplicados: resultado.duplicados,
          erros:      resultado.erros,
        },
      },
    );
  }
}
