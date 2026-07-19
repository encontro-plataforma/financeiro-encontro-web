export interface LancamentoFilterDto {
  data_inicio?:     string;
  data_fim?:        string;
  status?:          string;
  tipo?:            string;
  finalidade_id?:   number;       // scalar — tela de lançamentos (select único)
  finalidade_ids?:  number[];     // lista — pizza graph + dashboard filter
  forma_pagamento?: string[];
  descricao?:       string;
  exclude_ids?:     number[];
}
