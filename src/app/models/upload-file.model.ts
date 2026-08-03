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

export interface UploadErroProcessamento {
  linha: number | null;
  descricao: string | null;
  erro: string;
}

export interface UploadDuplicadoProcessamento {
  linha: number | null;
  descricao: string | null;
  valor: number;
  data: string;
}

export interface UploadResumoItem {
  /** Chave crua (ex: 'erros', 'duplicados'), usada para identificar os cards
   * clicáveis — não depende do rótulo traduzido. */
  key: string;
  chave: string;
  valor: string;
}

const ROTULOS_RESUMO: Record<string, string> = {
  inseridos: 'Inseridos',
  atualizados: 'Atualizados',
  ignorados: 'Ignorados',
  duplicados: 'Duplicados',
  erros: 'Erros',
};

/** Chaves do JSON de resultado_processamento que não devem aparecer na lista chave/valor do resumo. */
const CHAVES_RESUMO_OCULTAS = ['detalhes_ignorados', 'detalhes_erros', 'detalhes_duplicados', 'mensagem'];

function parseResultado(resultadoProcessamento: string | null): Record<string, unknown> | null {
  if (!resultadoProcessamento) return null;
  try {
    return JSON.parse(resultadoProcessamento);
  } catch {
    return null;
  }
}

/** Lista de erros linha-a-linha ocorridos durante o processamento do arquivo. */
export function parseErrosProcessamento(
  resultadoProcessamento: string | null,
): UploadErroProcessamento[] {
  const obj = parseResultado(resultadoProcessamento);
  const detalhes = obj?.['detalhes_erros'];
  return Array.isArray(detalhes) ? detalhes : [];
}

/** Lista de pagamentos que colidiram com um lançamento já existente (mesmo hash). */
export function parseDuplicadosProcessamento(
  resultadoProcessamento: string | null,
): UploadDuplicadoProcessamento[] {
  const obj = parseResultado(resultadoProcessamento);
  const detalhes = obj?.['detalhes_duplicados'];
  return Array.isArray(detalhes) ? detalhes : [];
}

/** Lista chave/valor (contagens) para exibição nos cards de totais. */
export function parseResumoProcessamento(
  resultadoProcessamento: string | null,
): UploadResumoItem[] {
  if (!resultadoProcessamento) return [];
  const obj = parseResultado(resultadoProcessamento);

  if (!obj) return [{ key: 'resumo', chave: 'Resumo', valor: resultadoProcessamento }];

  const itens = Object.entries(obj)
    .filter(([chave]) => !CHAVES_RESUMO_OCULTAS.includes(chave))
    .map(([chave, valor]) => ({ key: chave, chave: ROTULOS_RESUMO[chave] ?? chave, valor: String(valor) }));

  // "Processados" é derivado (inseridos + duplicados + erros), não vem do backend —
  // só faz sentido exibi-lo quando os três números de fato estão presentes.
  const inseridos = Number(obj['inseridos']);
  const duplicados = Number(obj['duplicados']);
  const erros = Number(obj['erros']);

  if (!Number.isNaN(inseridos) && !Number.isNaN(duplicados) && !Number.isNaN(erros)) {
    itens.unshift({ key: 'processados', chave: 'Processados', valor: String(inseridos + duplicados + erros) });
  }

  return itens;
}
