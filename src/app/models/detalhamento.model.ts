import { Lancamento } from './lancamento.model';

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
  /** Resumo do lançamento vinculado — usado pelo menu de "escolher lançamento"
   *  quando uma pessoa tem mais de um vínculo (ver DetalhamentoResponse.lancamento no backend). */
  lancamento?:         Lancamento | null;
}

/** Um vínculo de inscrição (Encontreiro/Encontrista) com um lançamento, já
 *  com o resumo do lançamento embutido — ver Encontreiro.detalhamentos_vinculados
 *  / Encontrista.detalhamentos_vinculados. */
export interface DetalhamentoVinculoResumo {
  id:            number;
  lancamento_id: number;
  tipo:          string;
  valor:         number;
  lancamento:    Lancamento;
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
