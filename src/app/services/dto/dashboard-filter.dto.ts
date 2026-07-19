export interface DashboardFilterDto {
  data_inicio?:     string;
  data_fim?:        string;
  tipo?:            string;
  status?:          string;
  forma_pagamento?: string[];
  finalidade_id?:   number[];
}
