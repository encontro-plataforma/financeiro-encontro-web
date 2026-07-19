export interface Finalidade {
  id:        number;
  nome:      string;
  descricao: string | null;
  tipo:      string;
}

export interface FinalidadeCreate {
  nome:      string;
  descricao: string | null;
  tipo:      string;
}

export interface FinalidadeUpdate {
  nome?:      string;
  descricao?: string | null;
  tipo?:      string;
}
