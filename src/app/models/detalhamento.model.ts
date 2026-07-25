export interface Detalhamento {
  id:                  number;
  lancamento_id:       number;
  tipo:                string;
  referencia_id:       number | null;
  valor:               number;
  descricao:           string;
  detalhe_nome:        string;
  observacao_efetiva:  string;
  criado_em:           string;
}

export interface DetalhamentoCreate {
  lancamento_id:  number;
  tipo:           string;
  referencia_id?: number | null;
  valor:          number;
  descricao?:     string;
}

export interface DetalhamentoUpdate {
  lancamento_id?: number;
  tipo?:          string;
  referencia_id?: number | null;
  valor?:         number;
  descricao?:     string;
}
