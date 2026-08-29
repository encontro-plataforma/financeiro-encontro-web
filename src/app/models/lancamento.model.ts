import { Finalidade } from './finalidade.model';

export interface Lancamento {
  id:                   number;
  descricao:            string;
  valor:                number;
  tipo:                 string;
  forma_pagamento:      string;
  status:               string;
  data_pagamento:       string;
  finalidade_id:        number | null;
  finalidade:           Finalidade | null;
  sugestao_finalidade:  Finalidade | null;
  observacao:           string | null;
  quantidade_detalhamentos: number;
  soma_detalhamentos:       number;
  cart_taxa:            number | null;
  cart_valor_liquido:   number | null;
  cart_parcelas:        number | null;
  criado_em:            string;
  atualizado_em:        string | null;
}

export interface LancamentoCreate {
  descricao:          string;
  valor:              number;
  tipo:               string;
  forma_pagamento:    string;
  data_pagamento:     string;
  finalidade_id:      number | null;
  observacao:         string | null;
  cart_taxa?:         number | null;
  cart_valor_liquido?: number | null;
  cart_parcelas?:     number | null;
}

export interface LancamentoUpdate {
  descricao?:         string;
  valor?:             number;
  tipo?:              string;
  forma_pagamento?:   string;
  status?:            string;
  data_pagamento?:    string;
  finalidade_id?:     number | null;
  observacao?:        string | null;
  cart_taxa?:         number | null;
  cart_valor_liquido?: number | null;
  cart_parcelas?:     number | null;
}
