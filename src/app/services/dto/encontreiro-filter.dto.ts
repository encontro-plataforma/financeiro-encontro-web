export interface EncontreiroFilterDto {
  nome_ou_apelido?:  string;
  equipe_ids?:       number[];
  situacao_camisa?:  string[];
  auditado?:         boolean;
}
