export interface AuditoriaResultado {
  avaliados:                              number;
  vinculados_encontreiro:                 number;
  vinculados_encontrista:                 number;
  detalhamentos_extras_via_observacao:    number;
  nao_auditados:                          number;
  detalhes_nao_auditados:                 { tipo: string; id: number; nome: string }[];
  mensagem:                               string;
}
