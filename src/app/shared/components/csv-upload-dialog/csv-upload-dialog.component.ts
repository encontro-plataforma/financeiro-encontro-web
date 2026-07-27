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
import { UploadErrosTableComponent } from '../upload-erros-table/upload-erros-table.component';
import { UploadTotaisCardsComponent } from '../upload-totais-cards/upload-totais-cards.component';
import {
  UploadErroProcessamento,
  UploadFile,
  UploadResumoItem,
  parseErrosProcessamento,
  parseMensagemProcessamento,
  parseResumoProcessamento,
} from '../../../models/upload-file.model';
import { StatusProcessamento } from '../../../models/constants/status-processamento';

export interface CsvUploadDialogData {
  titulo: string;
  endpoint: string;
}

type Etapa = 'selecao' | 'enviando' | 'processando' | 'concluido';

const POLLING_INTERVAL_MS = 5000;
const WIDTH_PADRAO = '70vw';
const WIDTH_ERRO = '80vw';
const HEIGHT_ERRO = '70vh';

@Component({
  selector: 'app-csv-upload-dialog',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule, UploadErrosTableComponent, UploadTotaisCardsComponent],
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
        width: WIDTH_PADRAO,
        height: '80vh',
        maxWidth: '90vw',
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

  // Calculados uma única vez ao carregar o resultado (não getters): recalculá-los a cada
  // ciclo de change detection devolveria um array novo a cada vez e resetaria a paginação
  // da tabela de erros (o [erros] do filho dispararia ngOnChanges a cada CD).
  mensagem: string | null = null;
  resumo: UploadResumoItem[] = [];
  errosDetalhados: UploadErroProcessamento[] = [];
  temErro = false;

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
        this.mensagem = parseMensagemProcessamento(upload.resultado_processamento);
        this.resumo = parseResumoProcessamento(upload.resultado_processamento);
        this.errosDetalhados = parseErrosProcessamento(upload.resultado_processamento);
        this.temErro = upload.status === 'ERRO' || this.errosDetalhados.length > 0;
        this.etapa = 'concluido';
        if (this.temErro) this.dialogRef.updateSize(WIDTH_ERRO, HEIGHT_ERRO);
        this.cdr.detectChanges();
      },
      error: () => {
        this.toast.error({ message: 'Erro ao buscar os dados do processamento.' });
        this.cdr.detectChanges();
      },
    });
  }

  fechar(): void {
    this.dialogRef.close(this.etapa === 'concluido' && !this.temErro);
  }
}
