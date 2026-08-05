export interface RegraCondicao {
  id?:           number;
  ordem:         number;
  padrao_regex:  string;
}

export interface Regra {
  id?:                          number;
  nome:                         string;
  ordem:                        number;
  ativo:                        boolean;
  tipo_detalhamento_resultado:  string;
  condicoes:                    RegraCondicao[];
}

export interface RegraGrupo {
  id:          number;
  nome:        string;
  descricao:   string | null;
  escopo:      string;
  ordem:       number;
  ativo:       boolean;
  regras:      Regra[];
}

export interface RegraGrupoUpdate {
  ativo?:  boolean;
  ordem?:  number;
  regras?: Regra[];
}
