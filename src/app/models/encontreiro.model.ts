import { Equipe } from './equipe.model';
import { Lancamento } from './lancamento.model';

export interface Encontreiro {
  id:                    number;
  dt_inscricao:          string | null;
  nome:                  string;
  apelido:               string | null;
  instagram:             string | null;
  telefone:              string | null;
  estado_civil:          string | null;
  igreja:                string | null;
  religiao:              string | null;
  contato_emerg:         string | null;
  nome_emerg:            string | null;
  parentesco_emerg:      string | null;
  alergia_comorbidade:   string | null;
  equipe_id:             number | null;
  equipe:                Equipe | null;
  camisa:                string | null;
  situacao_camisa:       string;
  veiculo:               string | null;
  dt_pagamento:          string | null;
  nome_pagador:          string | null;
  pagamento:             number | null;
  observacao:            string | null;
  criado_em:             string;
  auditado:              boolean;
  detalhamento_id:       number | null;
  lancamento_vinculado:  Lancamento | null;
}

export interface EncontreiroUpdate {
  dt_inscricao?:         string | null;
  nome?:                 string;
  apelido?:              string | null;
  instagram?:            string | null;
  telefone?:             string | null;
  estado_civil?:         string | null;
  igreja?:               string | null;
  religiao?:             string | null;
  contato_emerg?:        string | null;
  nome_emerg?:           string | null;
  parentesco_emerg?:     string | null;
  alergia_comorbidade?:  string | null;
  equipe_id?:            number | null;
  camisa?:               string | null;
  situacao_camisa?:      string;
  veiculo?:              string | null;
  dt_pagamento?:         string | null;
  nome_pagador?:         string | null;
  pagamento?:            number | null;
  observacao?:           string | null;
}
