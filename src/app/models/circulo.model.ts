export interface Circulo {
  id:        number;
  nome:      string;
  rgb:       string;
  /** Círculo(s) sentinela(s) de cancelamento (ex.: "CANCELADO") -- quando
   * true, o Encontrista com este círculo é considerado automaticamente
   * auditado, com ou sem lançamento vinculado. */
  cancelado: boolean;
}

export interface CirculoCreate {
  nome:       string;
  rgb:        string;
  cancelado?: boolean;
}

export interface CirculoUpdate {
  nome?:      string;
  rgb?:       string;
  cancelado?: boolean;
}
