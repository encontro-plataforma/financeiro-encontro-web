# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**financeiro-encontro-web** is the Angular frontend of the Financeiro Encontro platform — a financial management system for church events. It provides the UI for income/expense tracking, bank statement reconciliation, dashboards, and PDF reports.

This repository was extracted from the former `financeiro-encontro` monorepo (2026-07-19) and now lives alongside two sibling repositories under the `encontro-plataforma` GitHub org:

- [`financeiro-encontro-api`](https://github.com/encontro-plataforma/financeiro-encontro-api) — FastAPI backend (must be running for this app to work)
- [`infra-encontro`](https://github.com/encontro-plataforma/infra-encontro) — local Docker Compose infra (db, and full-stack orchestration)

For local full-stack development, clone all three repos as sibling folders (see `infra-encontro`'s README).

## Development Commands
```bash
npm install
npm start            # ng serve on :4200 — requires financeiro-encontro-api running (see its README)
npm run build         # production build
npm test              # vitest
npm run test:watch    # vitest watch mode
```

## Architecture

### Stack
- Angular 21 (standalone components, no NgModule) + TypeScript strict + SCSS
- Chart.js 4 + ng2-charts for dashboard graphs
- Vitest for tests

Routes defined in `src/app/app.routes.ts`, app bootstrapped in `src/app/app.config.ts` via `bootstrapApplication`.

### Structure (`src/app/`)
```
general/auth/      # authGuard (JWT), roleGuard (RBAC), authInterceptor
services/          # HTTP services extending AbstractService (pagination/filters), dto/ for filter DTOs
models/            # TypeScript interfaces mirroring the backend, constants/ for enums (Perfil, TipoLancamento, etc.)
shared/            # Reusable components (toast, multi-select, confirm-dialog), pipes, error-handler service
components/
  ├── login/
  ├── general/main/         # Shell with sidenav, filtered by user perfil
  ├── painel/dashboard/     # Charts (barra-mensal, barra-top-finalidades, pizza-finalidade)
  ├── financeiro/           # lancamentos, conciliacao
  ├── arquivos/             # Imported bank statements listing
  └── administracao/        # finalidades, usuarios, relatorios (role-gated)
```

### Authentication & Access Control
Login via `POST /auth/login` on the backend; JWT stored in `localStorage`, injected by `authInterceptor` on every request.

| Guard | Responsibility |
|---|---|
| `authGuard` | Redirects to `/login` if no valid token |
| `roleGuard` | Checks the user's `perfil` against `route.data.roles`; redirects to `/access-denied` otherwise |

| Perfil | Access |
|---|---|
| `ADMINISTRADOR` | Everything |
| `CONCILIADOR` | Dashboard, Lançamentos, Conciliação, Arquivos, Relatórios |
| `REPORTER` | Dashboard (read-only) and Relatórios |

### API Base URL
- Dev: `src/environments/environment.ts` — set `API_URL` to point at the local `financeiro-encontro-api` (default `http://localhost:8000`)
- Prod build: `src/environments/environment.prod.ts` has an `##API_URL##` placeholder, swapped at Docker build time (see `Dockerfile`) or by Render's `render.yaml` build command. Values are compiled into the bundle — cannot change post-build without recompiling.

## Key Config Locations
- **Deploy**: `render.yaml` (Render Blueprint — static site)
- **Docker**: `Dockerfile` (multi-stage: node build → nginx serve), `nginx.conf` (SPA rewrite, no reverse proxy to backend — frontend and backend are separate origins, calls go directly to `API_URL`)
- **package.json** version is currently informational only; not wired to any runtime display (unlike the backend's `APP_VERSION`)
