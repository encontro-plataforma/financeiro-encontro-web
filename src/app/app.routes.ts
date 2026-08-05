import { Routes } from '@angular/router';
import { authGuard } from './general/auth/auth.guard';
import { roleGuard }  from './general/auth/role.guard';

const ADMIN       = ['ADMINISTRADOR'];
const ADMIN_CONC  = ['ADMINISTRADOR', 'CONCILIADOR'];
const ADMIN_SECRETARIA = ['ADMINISTRADOR', 'SECRETARIO'];
const NAO_SECRETARIA   = ['ADMINISTRADOR', 'CONCILIADOR', 'REPORTER'];

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./components/general/main/main.component').then(m => m.MainComponent),
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'acesso-negado',
        loadComponent: () => import('./components/general/access-denied/access-denied.component').then(m => m.AccessDeniedComponent),
      },
      {
        path: 'dashboard',
        canActivate: [roleGuard],
        data: { roles: NAO_SECRETARIA },
        loadComponent: () => import('./components/painel/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'lancamentos',
        canActivate: [roleGuard],
        data: { roles: ADMIN_CONC },
        children: [
          {
            path: '',
            loadComponent: () => import('./components/financeiro/lancamentos/lancamentos.component').then(m => m.LancamentosComponent),
          },
          {
            path: 'novo',
            loadComponent: () => import('./components/financeiro/lancamentos/lancamentos-form/lancamentos-form.component').then(m => m.LancamentosFormComponent),
          },
          {
            path: ':id/editar',
            loadComponent: () => import('./components/financeiro/lancamentos/lancamentos-form/lancamentos-form.component').then(m => m.LancamentosFormComponent),
          },
        ],
      },
      {
        path: 'conciliacao',
        canActivate: [roleGuard],
        data: { roles: ADMIN_CONC },
        loadComponent: () => import('./components/financeiro/conciliacao/conciliar-lancamentos/conciliar-lancamentos.component').then(m => m.ConciliarLancamentosComponent),
      },
      {
        path: 'arquivos',
        canActivate: [roleGuard],
        data: { roles: ADMIN_CONC },
        loadComponent: () => import('./components/arquivos/arquivos.component').then(m => m.ArquivosComponent),
      },
      {
        path: 'secretaria',
        canActivate: [roleGuard],
        data: { roles: ADMIN_SECRETARIA },
        children: [
          {
            path: 'equipes',
            children: [
              {
                path: '',
                loadComponent: () => import('./components/secretaria/equipes/equipes.component').then(m => m.EquipesComponent),
              },
              {
                path: 'novo',
                loadComponent: () => import('./components/secretaria/equipes/equipes-form/equipes-form.component').then(m => m.EquipesFormComponent),
              },
              {
                path: ':id/editar',
                loadComponent: () => import('./components/secretaria/equipes/equipes-form/equipes-form.component').then(m => m.EquipesFormComponent),
              },
            ],
          },
          {
            path: 'circulos',
            children: [
              {
                path: '',
                loadComponent: () => import('./components/secretaria/circulos/circulos.component').then(m => m.CirculosComponent),
              },
              {
                path: 'novo',
                loadComponent: () => import('./components/secretaria/circulos/circulos-form/circulos-form.component').then(m => m.CirculosFormComponent),
              },
              {
                path: ':id/editar',
                loadComponent: () => import('./components/secretaria/circulos/circulos-form/circulos-form.component').then(m => m.CirculosFormComponent),
              },
            ],
          },
          {
            path: 'encontreiros',
            children: [
              {
                path: '',
                loadComponent: () => import('./components/secretaria/encontreiros/encontreiros.component').then(m => m.EncontreirosComponent),
              },
              {
                path: ':id/editar',
                loadComponent: () => import('./components/secretaria/encontreiros/encontreiros-form/encontreiros-form.component').then(m => m.EncontreirosFormComponent),
              },
            ],
          },
          {
            path: 'encontristas',
            children: [
              {
                path: '',
                loadComponent: () => import('./components/secretaria/encontristas/encontristas.component').then(m => m.EncontristasComponent),
              },
              {
                path: ':id/editar',
                loadComponent: () => import('./components/secretaria/encontristas/encontristas-form/encontristas-form.component').then(m => m.EncontristasFormComponent),
              },
            ],
          },
          {
            path: 'relatorios',
            loadComponent: () => import('./components/secretaria/relatorios/relatorios.component').then(m => m.SecretariaRelatoriosComponent),
          },
        ],
      },
      {
        path: 'administracao',
        children: [
          {
            path: 'relatorios',
            loadComponent: () => import('./components/administracao/relatorios/relatorios.component').then(m => m.RelatoriosComponent),
          },
          {
            path: 'usuarios',
            canActivate: [roleGuard],
            data: { roles: ADMIN },
            children: [
              {
                path: '',
                loadComponent: () => import('./components/administracao/usuarios/usuarios.component').then(m => m.UsuariosComponent),
              },
              {
                path: 'novo',
                loadComponent: () => import('./components/administracao/usuarios/usuarios-form/usuarios-form.component').then(m => m.UsuariosFormComponent),
              },
              {
                path: ':id/editar',
                loadComponent: () => import('./components/administracao/usuarios/usuarios-form/usuarios-form.component').then(m => m.UsuariosFormComponent),
              },
            ],
          },
          {
            path: 'finalidades',
            canActivate: [roleGuard],
            data: { roles: ADMIN },
            children: [
              {
                path: '',
                loadComponent: () => import('./components/administracao/finalidades/finalidades.component').then(m => m.FinalidadesComponent),
              },
              {
                path: 'novo',
                loadComponent: () => import('./components/administracao/finalidades/finalidades-form/finalidades-form.component').then(m => m.FinalidadesFormComponent),
              },
              {
                path: ':id/editar',
                loadComponent: () => import('./components/administracao/finalidades/finalidades-form/finalidades-form.component').then(m => m.FinalidadesFormComponent),
              },
            ],
          },
          {
            path: 'regras',
            canActivate: [roleGuard],
            data: { roles: ADMIN },
            loadComponent: () => import('./components/administracao/regras/regras.component').then(m => m.RegrasComponent),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('./components/general/not-found/not-found.component').then(m => m.NotFoundComponent),
  },
];
