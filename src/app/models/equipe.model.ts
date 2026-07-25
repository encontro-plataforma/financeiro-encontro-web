export interface Equipe {
  id:     number;
  nome:   string;
  acesso: string;
}

export interface EquipeCreate {
  nome:   string;
  acesso: string;
}

export interface EquipeUpdate {
  nome?:   string;
  acesso?: string;
}
