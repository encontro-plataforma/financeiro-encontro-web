# Histórico de Versões

## [0.1.0] — 2026-07-25

### Adicionado
- Módulo Secretaria: novo perfil `SECRETARIO` (cai direto em Equipes após login, só enxerga esta seção) e
  telas de Equipes e Círculos (listagem com filtros, criação e edição), seguindo o mesmo padrão das telas
  de Finalidades
- Dialog compartilhado de upload de CSV assíncrono (`CsvUploadDialogComponent`): drag-and-drop, envio ao
  backend, polling do status a cada 5s e exibição do resumo/erro ao final — será reaproveitado pelas
  telas de Encontreiros e Encontristas
- Tela de Arquivos Enviados ganha coluna de status e um botão para ver o resumo do processamento de cada
  upload
- Tela de Encontreiros: listagem (busca por nome/apelido, filtro por equipe e situação da camisa
  multi-select, filtro por auditado, badge colorido de auditado), edição (sem criação/exclusão manual —
  só entram via CSV) e seção para ligar/trocar/remover o vínculo com um lançamento
  (`VinculoLancamentoComponent`, `LancamentoPickerDialogComponent`, ambos compartilhados)

### Alterado
- `ExtratoBancarioService`/`ExtratoBancario` renomeados para `UploadFileService`/`UploadFile`, acompanhando
  a rota `/uploads` do backend

## [0.0.1] — 2026-07-18

### Adicionado
- Repositório extraído do monorepo `financeiro-encontro` como projeto independente
- Frontend Angular 21 (standalone components) para gestão financeira de eventos
- Autenticação JWT com guards de rota e controle de acesso por perfil de usuário
- Dashboard com gráficos e agregações financeiras
- CRUD de lançamentos, finalidades, extratos bancários e usuários
- Fluxo de conciliação via upload de CSV e telas de reconciliação manual
- Geração de relatórios em PDF (Livro Caixa e Resumo Geral)
