import { StatusProcessamento } from './constants/status-processamento';

export type TipoOrigemUpload = 'BANCARIO' | 'ESPECIE' | 'CARTAO' | 'ENCONTREIRO' | 'ENCONTRISTA' | null;

export interface UploadFile {
  id: number;
  nome_arquivo: string;
  tamanho_bytes: number | null;
  processado_em: string;
  status: StatusProcessamento;
  tipo_origem: TipoOrigemUpload;
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

/** Linha inserida com sucesso. Normaliza os dois formatos que o backend
 * produz hoje: fluxos financeiros (`descricao`/`valor`/`data`, de um
 * Lançamento) e fluxos de pessoa (`nome`/`id`, de um Encontreiro/Encontrista
 * -- `nome` cai em `descricao`, `valor`/`data` ficam `null`). */
export interface UploadInseridoProcessamento {
  linha: number | null;
  descricao: string | null;
  valor: number | null;
  data: string | null;
}

/** Linha ignorada por já existir uma pessoa com o mesmo nome+telefone
 * (hoje só o fluxo de Encontreiro detecta isso). */
export interface UploadIgnoradoProcessamento {
  linha: number | null;
  idCsv: number | null;
  existenteId: number | null;
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
const CHAVES_RESUMO_OCULTAS = [
  'detalhes_ignorados',
  'detalhes_erros',
  'detalhes_duplicados',
  'detalhes_inseridos',
  'mensagem',
];

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

/** Lista de linhas inseridas com sucesso no processamento do arquivo. */
export function parseInseridosProcessamento(
  resultadoProcessamento: string | null,
): UploadInseridoProcessamento[] {
  const obj = parseResultado(resultadoProcessamento);
  const detalhes = obj?.['detalhes_inseridos'];
  if (!Array.isArray(detalhes)) return [];

  return detalhes.map((item) => ({
    linha: item?.linha ?? null,
    descricao: item?.descricao ?? item?.nome ?? null,
    valor: item?.valor ?? null,
    data: item?.data ?? null,
  }));
}

/** Lista de linhas ignoradas por já existir uma pessoa com o mesmo nome+telefone. */
export function parseIgnoradosProcessamento(
  resultadoProcessamento: string | null,
): UploadIgnoradoProcessamento[] {
  const obj = parseResultado(resultadoProcessamento);
  const detalhes = obj?.['detalhes_ignorados'];
  if (!Array.isArray(detalhes)) return [];

  return detalhes.map((item) => ({
    linha: item?.linha ?? null,
    idCsv: item?.id_csv ?? null,
    existenteId: item?.existente_id ?? item?.encontreiro_existente_id ?? null,
  }));
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
