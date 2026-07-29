import { Circulo } from './circulo.model';
import { Lancamento } from './lancamento.model';

export interface PadrinhoResumo {
  id:   number;
  nome: string;
}

export interface Encontrista {
  id:                    number;
  dt_entrega:            string | null;
  dt_validade:           string | null;
  padrinho_id:           number;
  padrinho:              PadrinhoResumo | null;
  carta:                 boolean;
  album:                 boolean;
  nome:                  string;
  apelido:               string | null;
  dt_nascimento:         string | null;
  idade:                 number | null;
  circulo_id:            number | null;
  circulo:               Circulo | null;
  instagram:             string | null;
  contato:               string | null;
  religiao:              string | null;
  igreja:                string | null;
  endereco:              string | null;
  cidade:                string | null;
  camisa:                string | null;
  blusa:                 boolean;
  veiculo:               string | null;
  contato_emerg:         string | null;
  nome_emerg:            string | null;
  parentesco_emerg:      string | null;
  medicacao:             string | null;
  alergia_comorbidade:   string | null;
  dt_pagamento:          string | null;
  nome_pagador:          string | null;
  pagamento:             number | null;
  observacao:            string | null;
  criado_em:             string;
  auditado:              boolean;
  detalhamento_id:       number | null;
  lancamento_vinculado_id: number | null;
  lancamento_vinculado:  Lancamento | null;
}

export interface EncontristaUpdate {
  dt_entrega?:           string | null;
  dt_validade?:          string | null;
  padrinho_id?:          number;
  carta?:                boolean;
  album?:                boolean;
  nome?:                 string;
  apelido?:              string | null;
  dt_nascimento?:        string | null;
  idade?:                number | null;
  circulo_id?:           number | null;
  instagram?:            string | null;
  contato?:              string | null;
  religiao?:             string | null;
  igreja?:               string | null;
  endereco?:             string | null;
  cidade?:               string | null;
  camisa?:               string | null;
  blusa?:                boolean;
  veiculo?:              string | null;
  contato_emerg?:        string | null;
  nome_emerg?:           string | null;
  parentesco_emerg?:     string | null;
  medicacao?:            string | null;
  alergia_comorbidade?:  string | null;
  dt_pagamento?:         string | null;
  nome_pagador?:         string | null;
  pagamento?:            number | null;
  observacao?:           string | null;
}
