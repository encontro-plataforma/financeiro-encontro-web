# Histórico de Versões

## [0.2.3] — 2026-07-31

### Adicionado
- Dialog de vínculo de inscrição: novo campo "Buscar por nome do pagador" ao lado de "Buscar por nome ou
  apelido" (usa o novo filtro `nome_pagador` da API)
- Dialog de vínculo de inscrição: card de referência do lançamento sendo detalhado — descrição em destaque,
  data de pagamento + observação, e "Ainda Falta Vincular o Valor de R$ X" recalculado a cada vínculo criado

### Alterado
- Dialog de vínculo de inscrição: tabela de inscrições ganhou header fixo (sticky) com rolagem própria (até
  50% da altura da tela), fonte menor, e colunas Dt. Pagamento/Apelido/Valor Pago mais estreitas (data
  centralizada, valor à direita sem "R$")
- Dialog de vínculo de inscrição: título passa a mostrar "Selecionando detalhamento para Inscrição de
  Encontreiro/Encontrista" quando esse passo está ativo, no lugar do texto fixo "Incluir detalhamento"

### Corrigido
- `EncontreirosFormComponent`/`EncontristasFormComponent`: faltava importar `MaterialDatepickerModule` — o
  datepicker do formulário quebrava com "No provider found for DateAdapter" ao entrar na tela de detalhe

## [0.2.2] — 2026-07-26

### Corrigido
- Toast de erro/aviso/sucesso não conseguia aparecer nem ser clicado na frente de dialogs abertos: o
  Angular CDK 21 passou a renderizar overlays (dialogs, menus, etc.) usando a Popover API do navegador
  (top layer), que sempre pinta acima de qualquer elemento comum, não importa o `z-index`. O toast (`app-
  toast`) agora também usa `popover="manual"` e é promovido ao topo do top layer a cada novo toast, para
  continuar na frente de qualquer tela ou dialog

## [0.2.1] — 2026-07-26

### Corrigido
- Listagem de Detalhamentos na tela de Editar Lançamento e o resumo de Detalhamentos dentro do dialog de
  vínculo passam a usar `mat-table` paginada (5 itens por página), no lugar da lista em divs sem paginação
- Resumo de Detalhamentos do dialog agora exibe o texto digitado para Oferta/Outro (antes só mostrava o
  rótulo genérico do tipo)
- Labels padrão do `mat-paginator` (ex. "of" → "de") traduzidos para pt-BR em toda a aplicação, via
  `MatPaginatorIntl` global registrado em `app.config.ts`
- `ErrorHandlerService` retornava sempre uma mensagem genérica ("Requisição inválida.") para erros 400,
  sem nunca chegar a ler o campo `detail` retornado pela API — mensagens específicas de validação de
  negócio (ex. soma de Detalhamentos excedente) nunca apareciam no toast. Agora o `detail` é priorizado
  antes dos fallbacks genéricos por status

### Alterado
- Área de Detalhamentos do card de Conciliação ganhou destaque visual (gap, fundo e sombra) e o botão de
  vincular passou a ter formato quadrado com cor de destaque

## [0.2.0] — 2026-07-25

### Adicionado
- Tela de Conciliação: botão "Processar Conciliação" (dispara `POST /detalhamentos/auditoria`) — mostra uma
  mensagem de "Auditando Lançamentos e Inscrições..." no lugar dos cards enquanto processa e, ao final, um
  dialog com o resumo do resultado. Novo select "Tipo" (Receita/Despesa, padrão Receita) filtra quais
  lançamentos pendentes aparecem na tela
- Cards de conciliação passam a exibir a quantidade de Detalhamentos vinculados ao lançamento, com um
  botão para abrir o dialog de vínculo (mesmo componente usado na tela de Editar Lançamento). Ao clicar em
  "Conciliar" com valor restante (Total − Detalhamentos), um dialog de confirmação mostra o cálculo e cria
  um Detalhamento com esse valor (pré-preenchido conforme a finalidade escolhida)
- Campo Observação do card de conciliação agora vem pré-preenchido com a observação do próprio lançamento

### Alterado
- `DetalhamentoPickerDialogComponent` movido de `financeiro/lancamentos/lancamentos-form/` para
  `financeiro/shared/` — passa a ser o mesmo componente usado tanto na tela de Editar Lançamento quanto nos
  cards de Conciliação. Reestilizado: opções em botões quadrados empilhados com ícone de seta e destaque no
  hover; botão "Cancelar" da tela inicial virou "Fechar"; a tela passa a listar os Detalhamentos já
  vinculados ao lançamento (com opção de remover) antes de fechar; campos de Oferta/Outro usam `input` em
  vez de `textarea`; passo de inscrição usa 60% da largura da tela com a Observação como coluna mais larga
- Botão "Incluir" do card de Detalhamentos (tela de Editar Lançamento) alinhado ao mesmo estilo de "Salvar
  alterações"/"Conciliar"
- Picker de lançamento usado em "Ligar a um Lançamento" (Encontreiro/Encontrista) passa a filtrar somente
  lançamentos de RECEITA

## [0.1.1] — 2026-07-25

### Alterado
- Listagem de Lançamentos: removido o botão "Buscar" — os filtros agora aplicam automaticamente, como nas
  demais telas
- Upload de extrato bancário: botão "Enviar CSV" sai da tela de Conciliação e vai para a listagem de
  Lançamentos, usando o mesmo `CsvUploadDialogComponent` (assíncrono, com polling) das telas de
  Encontreiros/Encontristas
- Tela de Conciliação (`/conciliacao`) vai direto para "Conciliar Lançamentos" — removida a tela
  intermediária de drag-and-drop (`ConciliacaoComponent`) e seu dialog de resumo, que ficaram redundantes
- Ordem das seções do menu lateral: Painel, Administração, Arquivos, Secretaria, Financeiro

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
- Tela de Encontristas: mesmo formato da tela de Encontreiros — listagem com filtro de círculo
  multi-select (incluindo "Sem Círculo"), filtro por padrinho e por auditado, edição reaproveitando os
  mesmos componentes compartilhados de vínculo com lançamento
- Tela de Lançamento (edição) ganha a lista de Detalhamentos vinculados, com botão para ir até a
  inscrição referenciada (preservando o retorno para o lançamento de origem) e excluir; botão "Incluir"
  abre um novo seletor (`DetalhamentoPickerDialogComponent`) que cria uma Oferta/Outro diretamente ou
  vincula uma inscrição de Encontreiro/Encontrista ainda não auditada (busca paginada, 8 por página)

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
