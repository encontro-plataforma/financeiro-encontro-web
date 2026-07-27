import { StatusProcessamento } from './constants/status-processamento';

export interface UploadFile {
  id: number;
  nome_arquivo: string;
  tamanho_bytes: number | null;
  processado_em: string;
  status: StatusProcessamento;
  error_code: string | null;
  error_message: string | null;
  resultado_processamento: string | null;
}

export interface UploadFileStatus {
  id: number;
  status: StatusProcessamento;
}
