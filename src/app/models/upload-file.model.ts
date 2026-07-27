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

export interface UploadResumoItem {
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
const CHAVES_RESUMO_OCULTAS = ['detalhes_ignorados', 'detalhes_erros', 'mensagem'];

function parseResultado(resultadoProcessamento: string | null): Record<string, unknown> | null {
  if (!resultadoProcessamento) return null;
  try {
    return JSON.parse(resultadoProcessamento);
  } catch {
    return null;
  }
}

/** Mensagem de resumo em destaque (ex: "Processamento concluído. 5 inseridos..."). */
export function parseMensagemProcessamento(resultadoProcessamento: string | null): string | null {
  const obj = parseResultado(resultadoProcessamento);
  return typeof obj?.['mensagem'] === 'string' ? (obj['mensagem'] as string) : null;
}

/** Lista de erros linha-a-linha ocorridos durante o processamento do arquivo. */
export function parseErrosProcessamento(resultadoProcessamento: string | null): UploadErroProcessamento[] {
  const obj = parseResultado(resultadoProcessamento);
  const detalhes = obj?.['detalhes_erros'];
  return Array.isArray(detalhes) ? detalhes : [];
}

/** Lista chave/valor (contagens) para exibição nos cards de totais. */
export function parseResumoProcessamento(resultadoProcessamento: string | null): UploadResumoItem[] {
  if (!resultadoProcessamento) return [];
  const obj = parseResultado(resultadoProcessamento);

  if (!obj) return [{ chave: 'Resumo', valor: resultadoProcessamento }];

  const itens = Object.entries(obj)
    .filter(([chave]) => !CHAVES_RESUMO_OCULTAS.includes(chave))
    .map(([chave, valor]) => ({ chave: ROTULOS_RESUMO[chave] ?? chave, valor: String(valor) }));

  // "Processados" é derivado (inseridos + duplicados + erros), não vem do backend —
  // só faz sentido exibi-lo quando os três números de fato estão presentes.
  const inseridos = Number(obj['inseridos']);
  const duplicados = Number(obj['duplicados']);
  const erros = Number(obj['erros']);

  if (!Number.isNaN(inseridos) && !Number.isNaN(duplicados) && !Number.isNaN(erros)) {
    itens.unshift({ chave: 'Processados', valor: String(inseridos + duplicados + erros) });
  }

  return itens;
}
