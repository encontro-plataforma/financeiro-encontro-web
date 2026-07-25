export interface Circulo {
  id:   number;
  nome: string;
  rgb:  string;
}

export interface CirculoCreate {
  nome: string;
  rgb:  string;
}

export interface CirculoUpdate {
  nome?: string;
  rgb?:  string;
}
