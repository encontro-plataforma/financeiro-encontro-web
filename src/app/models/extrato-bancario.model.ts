export interface ExtratoBancario {
  id:              number;
  nome_arquivo:    string;
  caminho_arquivo: string;
  tamanho_bytes:   number | null;
  processado_em:   string;
}
