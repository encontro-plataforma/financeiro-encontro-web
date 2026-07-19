# Financeiro Encontro — Frontend

Frontend do sistema **Financeiro Encontro**, interface web para gerenciamento financeiro de eventos da igreja.

---

## Tecnologias

- Angular 21 (standalone components)
- TypeScript 5.9 (strict mode)
- SCSS
- Chart.js 4 + ng2-charts (gráficos do dashboard)
- Moment.js
- Vitest

---

## Pré-requisitos

O backend deve estar rodando antes de iniciar o frontend.
Veja as instruções no repositório [`financeiro-encontro-api`](https://github.com/encontro-plataforma/financeiro-encontro-api).

---

## Como rodar

```bash
npm install
npm start        # ng serve em http://localhost:4200
```

## Verificação do backend

O frontend depende do backend rodando na URL configurada em `src/environments/environment.ts`. Para checar se a API está disponível, você pode consultar o endpoint de saúde do backend:

```bash
curl http://localhost:8000/health
```

A resposta agora inclui o `status` e a `version` do backend, por exemplo:

```json
{
  "status": "ok",
  "version": "0.0.1"
}
```

---

## Comandos disponíveis

| Comando | Descrição |
|---|---|
| `npm start` | Servidor de desenvolvimento em `:4200` |
| `npm run build` | Build de produção em `dist/` |
| `npm test` | Testes unitários com Vitest |
| `npm run test:watch` | Testes em modo watch (Vitest) |

---

## Estrutura do projeto

```
src/
├── environments/
│   ├── environment.ts          # API_URL desenvolvimento
│   └── environment.prod.ts     # API_URL produção
├── app/
│   ├── models/                 # Interfaces TypeScript (espelham o backend)
│   ├── services/               # Serviços HTTP (extendem AbstractService)
│   │   ├── abstract.service.ts # Base genérica com paginação e filtros
│   │   ├── auth.service.ts
│   │   ├── lancamento.service.ts
│   │   ├── finalidade.service.ts
│   │   ├── extrato-bancario.service.ts
│   │   ├── conciliacao.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── dashboard-state.service.ts  # Estado compartilhado do dashboard
│   │   ├── relatorio.service.ts        # Download de PDFs (Livro Caixa, Resumo Geral)
│   │   ├── usuario.service.ts          # CRUD de usuários
│   │   ├── dto/                # DTOs de filtro para cada endpoint
│   │   └── util/               # Utilitários (PageTemplate)
│   ├── general/
│   │   └── auth/               # authGuard (JWT), roleGuard (RBAC), authInterceptor
│   └── components/             # Componentes por tela (lazy loaded)
│       ├── login/
│       ├── main/               # Shell principal com navegação lateral filtrada por perfil
│       ├── dashboard/
│       │   └── graphs/         # Gráficos Chart.js
│       │       ├── barra-mensal/
│       │       ├── barra-top-finalidades/
│       │       └── pizza-finalidade/
│       │           └── lista-lancamentos-graph/
│       ├── lancamentos/
│       │   └── lancamentos-form/
│       ├── conciliacao/
│       │   ├── conciliacao-upload-dialog/
│       │   └── conciliar-lancamentos/
│       │       └── conciliacao-card/
│       ├── arquivos/           # Listagem de extratos importados
│       ├── administracao/
│       │   ├── finalidades/
│       │   │   └── finalidades-form/
│       │   ├── usuarios/       # CRUD de usuários (somente ADMINISTRADOR)
│       │   │   └── usuarios-form/
│       │   └── relatorios/     # Geração de PDFs (todos os perfis)
│       ├── access-denied/      # Página 403 — usuário sem permissão para a rota
│       └── not-found/          # Página 404 — rota inexistente
└── styles.scss                 # Estilos globais
```

---

## Autenticação e Controle de Acesso

O login é feito via `POST /auth/login`. O token JWT retornado é salvo no `localStorage` e injetado automaticamente em todas as requisições pelo `authInterceptor`.

Existem dois guards de rota:

| Guard | Responsabilidade |
|---|---|
| `authGuard` | Redireciona para `/login` se não há token válido |
| `roleGuard` | Verifica o campo `perfil` do usuário contra `route.data.roles`; redireciona para `/access-denied` se o perfil não tem permissão |

### Perfis de Acesso

| Perfil | Telas acessíveis |
|---|---|
| `ADMINISTRADOR` | Todas — Dashboard, Lançamentos, Conciliação, Arquivos, Finalidades, Usuários, Relatórios |
| `CONCILIADOR` | Dashboard, Lançamentos, Conciliação, Arquivos, Relatórios |
| `REPORTER` | Dashboard (sem navegar para lançamentos ao clicar nas linhas) e Relatórios |

O menu lateral (`MainComponent`) filtra automaticamente as seções e itens pelo perfil do usuário logado. O modelo `PerfilUsuario` e as constantes `Perfil` estão em `models/constants/perfil.ts`.

---

## Variáveis de ambiente

### Desenvolvimento local

O Angular usa `src/environments/environment.ts` automaticamente com `npm start`. Edite o arquivo para apontar para o backend correto:

```typescript
export const environment = {
  production: false,
  API_URL: 'http://localhost:8000'
};
```

### Produção (build)

O `ng build` troca automaticamente `environment.ts` por `environment.prod.ts` (configurado via `fileReplacements` no `angular.json`).

Os valores de `environment` são **compilados dentro do bundle** em tempo de build — não é possível alterá-los depois sem recompilar.

### Deploy em nuvem (Docker)

Passe a URL do backend como build arg:

```bash
docker build --build-arg API_URL=https://api.seudominio.com -t financeiro-frontend .
```

Se omitido, o valor padrão é `http://localhost:8000`.

> O Dockerfile substitui o placeholder `##API_URL##` em `environment.prod.ts` antes de compilar o Angular.
