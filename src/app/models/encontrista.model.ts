import { Circulo } from './circulo.model';
import { Equipe } from './equipe.model';

export interface PadrinhoResumo {
  id:      number;
  nome:    string;
  apelido: string | null;
  equipe:  Equipe | null;
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
  onde_veio_ficha:       string | null;
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
  is_pagamento_multiplo: boolean;
  quantidade_lancamentos_vinculados: number;
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
  onde_veio_ficha?:      string | null;
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
