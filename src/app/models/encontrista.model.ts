import { Circulo } from './circulo.model';
import { DetalhamentoVinculoResumo } from './detalhamento.model';
import { Equipe } from './equipe.model';
import { Lancamento } from './lancamento.model';

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
  // Campos legados (compatibilidade) — representam sempre o vínculo mais
  // antigo, mesmo quando há vários. Preferir os campos abaixo.
  detalhamento_id:       number | null;
  lancamento_vinculado_id: number | null;
  lancamento_vinculado:  Lancamento | null;
  // Só vêm populados no detalhe (buscarPorId); na listagem ficam como [].
  detalhamentos_vinculados: DetalhamentoVinculoResumo[];
  lancamentos_vinculados:   Lancamento[];
  total_vinculado:          number;
  saldo_pendente:           number | null;
  quantidade_vinculos:      number;
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
