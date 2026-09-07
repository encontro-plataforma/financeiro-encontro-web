export interface EncontreiroFilterDto {
  nome_ou_apelido?:  string;
  nome_pagador?:     string;
  equipe_ids?:       number[];
  situacao_camisa?:  string[];
  auditado?:         boolean;
}
