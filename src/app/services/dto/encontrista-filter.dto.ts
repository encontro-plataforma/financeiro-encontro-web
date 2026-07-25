export interface EncontristaFilterDto {
  nome_ou_apelido?: string;
  circulo_ids?:     number[]; // 0 = "sem círculo"
  padrinho_id?:     number;
  auditado?:        boolean;
}
