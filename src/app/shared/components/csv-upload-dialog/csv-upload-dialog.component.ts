import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import { Subscription, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { environment } from '../../../../environments/environment';
import { MaterialGlobalModule } from '../../modules/material.imports.module';
import { ToastService } from '../toast/toast.service';
import { UploadFileService } from '../../../services/upload-file.service';
import { UploadFile } from '../../../models/upload-file.model';
import { StatusProcessamento } from '../../../models/constants/status-processamento';

export interface CsvUploadDialogData {
  titulo: string;
  endpoint: string;
}

type Etapa = 'selecao' | 'enviando' | 'processando' | 'concluido';

interface ResumoItem {
  chave: string;
  valor: string;
}

interface ErroItem {
  linha: number | null;
  descricao: string | null;
  erro: string;
}

const CHAVES_OCULTAS = ['detalhes_ignorados', 'detalhes_erros'];

const ROTULOS: Record<string, string> = {
  inseridos: 'Inseridos',
  atualizados: 'Atualizados',
  ignorados: 'Ignorados',
  duplicados: 'Duplicados',
  erros: 'Erros',
  mensagem: 'Mensagem',
};

const POLLING_INTERVAL_MS = 5000;

@Component({
  selector: 'app-csv-upload-dialog',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule],
  templateUrl: './csv-upload-dialog.component.html',
  styleUrl: './csv-upload-dialog.component.scss',
})
export class CsvUploadDialogComponent implements OnDestroy {
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  /** Abre o dialog já com o tamanho padrão (80% altura, 70% largura, centralizado). */
  static open(
    dialog: MatDialog,
    data: CsvUploadDialogData,
    config?: MatDialogConfig,
  ): MatDialogRef<CsvUploadDialogComponent, boolean> {
    return dialog.open<CsvUploadDialogComponent, CsvUploadDialogData, boolean>(
      CsvUploadDialogComponent,
      {
        width: '70vw',
        height: '80vh',
        maxWidth: '70vw',
        disableClose: true,
        data,
        ...config,
      },
    );
  }

  etapa: Etapa = 'selecao';
  dragOver = false;
  nomeArquivo = '';
  upload: UploadFile | null = null;

  private pollingSub?: Subscription;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: CsvUploadDialogData,
    private dialogRef: MatDialogRef<CsvUploadDialogComponent, boolean>,
    private http: HttpClient,
    private uploadFileService: UploadFileService,
    private toast: ToastService,
  ) {}

  ngOnDestroy(): void {
    this.pollingSub?.unsubscribe();
  }

  abrirSeletor(): void {
    if (this.etapa !== 'selecao') return;
    this.fileInputRef.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.enviar(file);
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.etapa === 'selecao') this.dragOver = true;
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
    if (this.etapa !== 'selecao') return;

    const file = event.dataTransfer?.files?.[0];
    if (file) this.enviar(file);
  }

  private enviar(file: File): void {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.toast.warning({ message: 'Apenas arquivos .csv são aceitos.' });
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      this.toast.error({
        message: 'Arquivo está acima do limite permitido de tamanho de dados (3 MB).',
      });
      return;
    }

    this.nomeArquivo = file.name;
    this.etapa = 'enviando';

    const formData = new FormData();
    formData.append('file', file, file.name);

    this.http
      .post<{
        upload_id: number;
        status: string;
      }>(`${environment.API_URL}${this.data.endpoint}`, formData, { withCredentials: true })
      .subscribe({
        next: (resposta) => {
          this.etapa = 'processando';
          this.iniciarPolling(resposta.upload_id);
        },
        error: (err) => {
          this.etapa = 'selecao';
          this.toast.error({ message: err?.error?.detail ?? 'Erro ao enviar o arquivo.' });
        },
      });
  }

  private iniciarPolling(uploadId: number): void {
    this.pollingSub = timer(0, POLLING_INTERVAL_MS)
      .pipe(switchMap(() => this.uploadFileService.buscarStatusPorId(uploadId)))
      .subscribe({
        next: (statusResp) => {
          if (statusResp.status === StatusProcessamento.PROCESSANDO) return;
          this.pollingSub?.unsubscribe();
          this.carregarResultado(uploadId);
        },
        error: () => {
          this.pollingSub?.unsubscribe();
          this.toast.error({ message: 'Erro ao consultar o status do processamento.' });
          this.cdr.detectChanges();
        },
      });
  }

  private carregarResultado(uploadId: number): void {
    this.uploadFileService.buscarPorId(uploadId).subscribe({
      next: (upload) => {
        this.upload = upload;
        this.etapa = 'concluido';
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.error({ message: 'Erro ao buscar os dados do processamento.' });
        this.cdr.detectChanges();
      },
    });
  }

  get resumo(): ResumoItem[] {
    if (!this.upload?.resultado_processamento) return [];
    try {
      const obj = JSON.parse(this.upload.resultado_processamento);
      return Object.entries(obj)
        .filter(([chave]) => !CHAVES_OCULTAS.includes(chave))
        .map(([chave, valor]) => ({ chave: ROTULOS[chave] ?? chave, valor: String(valor) }));
    } catch {
      return [{ chave: 'Resumo', valor: this.upload.resultado_processamento }];
    }
  }

  get errosDetalhados(): ErroItem[] {
    if (!this.upload?.resultado_processamento) return [];
    try {
      const obj = JSON.parse(this.upload.resultado_processamento);
      return Array.isArray(obj?.detalhes_erros) ? obj.detalhes_erros : [];
    } catch {
      return [];
    }
  }

  get temErro(): boolean {
    return this.upload?.status === 'ERRO' || this.errosDetalhados.length > 0;
  }

  fechar(): void {
    this.dialogRef.close(this.etapa === 'concluido' && !this.temErro);
  }
}
