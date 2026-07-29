# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**financeiro-encontro-web** is the Angular frontend of the Financeiro Encontro platform — a management system for church "Encontro" events. It covers two connected domains:

- **Financeiro** (`components/financeiro/`, `painel/`, `arquivos/`): income/expense tracking, bank statement reconciliation, dashboards, uploaded-file history.
- **Secretaria** (`components/secretaria/`): registration management for Encontristas/Encontreiros, grouped into Círculos/Equipes, also via CSV import.

This repository was extracted from the former `financeiro-encontro` monorepo (2026-07-19) and now lives alongside two sibling repositories under the `encontro-plataforma` GitHub org:

- [`financeiro-encontro-api`](https://github.com/encontro-plataforma/financeiro-encontro-api) — FastAPI backend (must be running for this app to work)
- [`infra-encontro`](https://github.com/encontro-plataforma/infra-encontro) — local Docker Compose infra (db, and full-stack orchestration)

For local full-stack development, clone all three repos as sibling folders (see `infra-encontro`'s README).

## Development Commands

```bash
npm install
npm start            # ng serve on :4200 — requires financeiro-encontro-api running (see its README)
npm run build         # production build
npm test              # ng test — Angular's unit-test builder (Vitest under the hood)
```

## Architecture

### Stack

- Angular 21 (standalone components, no NgModule) + TypeScript strict + Angular Material 21 + SCSS
- Tailwind CSS 4 alongside Material (utility classes for layout, Material for components/theming)
- Chart.js 4 + ng2-charts for dashboard graphs, `moment` for date handling (Material's moment adapter)
- Vitest (via `@angular/build:unit-test`) for tests

Routes defined in `src/app/app.routes.ts`, app bootstrapped in `src/app/app.config.ts` via `bootstrapApplication`.

### Structure (`src/app/`)

```text
general/auth/      # authGuard (JWT), roleGuard (RBAC), authInterceptor
services/          # HTTP services extending AbstractService (pagination/filters), dto/ for filter DTOs
models/            # TypeScript interfaces mirroring the backend, constants/ for enums (Perfil, TipoLancamento, etc.)
shared/            # Reusable components, pipes, i18n, error-handler service
components/
  ├── login/
  ├── general/               # main (shell w/ sidenav), access-denied, not-found
  ├── painel/dashboard/      # Charts (barra-mensal, barra-top-finalidades, pizza-finalidade)
  ├── financeiro/
  │   ├── lancamentos/       # list + form, with nested lancamento-detalhamentos
  │   ├── conciliacao/       # conciliar-lancamentos (cards grid) + conciliacao-card
  │   └── shared/            # auditoria-resumo-dialog, conciliar-resto-dialog, detalhamento-picker-dialog
  ├── arquivos/              # uploaded-file history listing (all CSV imports) + upload-resumo-dialog
  ├── secretaria/            # encontristas, encontreiros, circulos, equipes, relatorios
  └── administracao/         # finalidades, usuarios, relatorios (ADMIN-only)
```

### Authentication & Access Control

Login via `POST /auth/login` on the backend; JWT stored in `localStorage`, injected by `authInterceptor` on every request.

| Guard | Responsibility |
|---|---|
| `authGuard` | Redirects to `/login` if no valid token |
| `roleGuard` | Checks the user's `perfil` against `route.data.roles`; redirects to `/acesso-negado` otherwise |

Role constants used in `app.routes.ts` (`PerfilUsuario`, `src/app/models/constants/perfil.ts`): `ADMINISTRADOR`, `CONCILIADOR`, `REPORTER`, `SECRETARIO`.

| Route group | `data.roles` | Notes |
|---|---|---|
| `/dashboard` | `[ADMINISTRADOR, CONCILIADOR, REPORTER]` | Not accessible to SECRETARIO |
| `/lancamentos`, `/conciliacao`, `/arquivos` | `[ADMINISTRADOR, CONCILIADOR]` | Financeiro area — SECRETARIO has no access to upload history, by design |
| `/secretaria/*` | `[ADMINISTRADOR, SECRETARIO]` | Encontristas/Encontreiros/Círculos/Equipes/Relatorios |
| `/administracao/usuarios`, `/administracao/finalidades` | `[ADMINISTRADOR]` | |
| `/administracao/relatorios` | none | Any authenticated user |

### CSV Upload Flow — single shared component

Three screens upload CSVs against different backend endpoints, but all three call the **same** `CsvUploadDialogComponent` (`shared/components/csv-upload-dialog/`), just with a different `{ titulo, endpoint }`:

- Lançamentos (`/conciliacao/upload`) — bank statement reconciliation
- Encontristas (`/encontristas/conciliacao`)
- Encontreiros (`/encontreiros/conciliacao`)

Flow: select/drag file → `POST` the endpoint → poll `GET /uploads/{id}/status` (lightweight) every 5s until it leaves `PROCESSANDO` → fetch the full record via `GET /uploads/{id}` → render the result via the shared `UploadResumoComponent`, and fire a toast (success/error).

`UploadResumoComponent` (`shared/components/upload-resumo/`, nested `upload-erros-table/` + `upload-totais-cards/`) is the single presentational "resumo" body — same content whether shown live at the end of an upload (`CsvUploadDialogComponent`) or historically from the `/arquivos` listing (`UploadResumoDialogComponent`, `components/arquivos/upload-resumo-dialog/`). It takes `@Input() upload: UploadFile` and derives everything (message, totals cards, error table) from `resultado_processamento`. Its static `UploadResumoComponent.getInfo(upload)` is also the single source of truth for how big the hosting dialog should be — sizes are `clamp()`-based (scale with viewport, with a floor so content always fits and a ceiling to avoid an absurd dialog on ultrawide monitors); callers never hardcode a width/height themselves.

### Auditoria (automated linking)

Triggered by the "Processar Conciliação" button on `/conciliacao` (`ConciliarLancamentosComponent.processarConciliacao()`) → `DetalhamentoService.auditoria()` → `POST /detalhamentos/auditoria`. Result (`AuditoriaResultado`) is shown in `AuditoriaResumoDialogComponent` (`components/financeiro/shared/`), then the conciliação list reloads. This is a *different* feature from the upload-resumo family above — it's a backend batch matching pass over already-imported data, not a CSV import.

### Shared components (`shared/components/`)

`confirm-dialog`, `multi-select`, `toast` (+ `toast.service.ts`, uses the Popover API so toasts render above CDK dialogs), `auditado-badge` (Sim/Não pill), `lancamento-picker-dialog`, `vinculo-lancamento` (link/relink/unlink a Lancamento to an inscription), `csv-upload-dialog`, `upload-resumo` (see above).

Note: `detalhamento-picker-dialog`, `auditoria-resumo-dialog`, `conciliar-resto-dialog` are financeiro-scoped under `components/financeiro/shared/`, not `shared/components/` — they're not reused outside that area.

### API Base URL

- Dev: `src/environments/environment.ts` — set `API_URL` to point at the local `financeiro-encontro-api` (default `http://localhost:8000`)
- Prod build: `src/environments/environment.prod.ts` has an `##API_URL##` placeholder, swapped at Docker build time (see `Dockerfile`) or by Render's `render.yaml` build command. Values are compiled into the bundle — cannot change post-build without recompiling.

## Key Config Locations

- **Deploy**: `render.yaml` (Render Blueprint — static site)
- **Docker**: `Dockerfile` (multi-stage: node build → nginx serve), `nginx.conf` (SPA rewrite, no reverse proxy to backend — frontend and backend are separate origins, calls go directly to `API_URL`)
- **package.json** version is currently informational only; not wired to any runtime display (unlike the backend's `APP_VERSION`)
