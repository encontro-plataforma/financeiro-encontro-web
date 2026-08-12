import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MaterialGlobalModule } from '../../../shared/modules/material.imports.module';
import { AuthService } from '../../../services/auth.service';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastComponent } from '../../../shared/components/toast/toast.component';
import { Usuario } from '../../../models/usuario.model';
import { PerfilUsuario } from '../../../models/constants/perfil';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: PerfilUsuario[];
}

interface NavSection {
  title: string;
  items: NavItem[];
  roles?: PerfilUsuario[];
}

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MaterialGlobalModule, ToastComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit{
  private authService = inject(AuthService);
  private router      = inject(Router);
  private dialog      = inject(MatDialog);

  collapsed = signal(false);

  usuario: Usuario | null = null;

  private readonly _allSections: NavSection[] = [
    {
      title: 'Painel',
      items: [
        { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
      ],
    },
    {
      title: 'Administração',
      items: [
        { label: 'Finalidades', icon: 'label',          route: '/administracao/finalidades', roles: [PerfilUsuario.ADMINISTRADOR] },
        { label: 'Usuários',    icon: 'group',           route: '/administracao/usuarios',   roles: [PerfilUsuario.ADMINISTRADOR] },
        { label: 'Regras',      icon: 'rule',            route: '/administracao/regras',     roles: [PerfilUsuario.ADMINISTRADOR] },
        { label: 'Relatórios',  icon: 'picture_as_pdf',  route: '/administracao/relatorios' },
      ],
    },
    {
      title: 'Arquivos',
      roles: [PerfilUsuario.ADMINISTRADOR, PerfilUsuario.CONCILIADOR],
      items: [
        { label: 'Arquivos Enviados', icon: 'folder_open', route: '/arquivos' },
      ],
    },
    {
      title: 'Secretaria',
      roles: [PerfilUsuario.ADMINISTRADOR, PerfilUsuario.SECRETARIO],
      items: [
        { label: 'Equipes',      icon: 'groups',                route: '/secretaria/equipes' },
        { label: 'Círculos',     icon: 'radio_button_checked',  route: '/secretaria/circulos' },
        { label: 'Encontreiros', icon: 'volunteer_activism',    route: '/secretaria/encontreiros' },
        { label: 'Encontristas', icon: 'diversity_3',           route: '/secretaria/encontristas' },
        { label: 'Relatórios',   icon: 'summarize',              route: '/secretaria/relatorios' },
      ],
    },
    {
      title: 'Financeiro',
      roles: [PerfilUsuario.ADMINISTRADOR, PerfilUsuario.CONCILIADOR],
      items: [
        { label: 'Lançamentos', icon: 'receipt_long', route: '/lancamentos' },
        { label: 'Conciliação', icon: 'sync_alt',     route: '/conciliacao' },
      ],
    },
  ];

  get navSections(): NavSection[] {
    const perfil: PerfilUsuario | undefined = this.usuario?.perfil;
    return this._allSections
      .filter(s => !s.roles || (perfil && s.roles.includes(perfil)))
      .map(s => ({
        ...s,
        items: s.items.filter(i => !i.roles || (perfil && i.roles.includes(perfil))),
      }))
      .filter(s => s.items.length > 0);
  }

  get nomeExibido(): string {
    const nome = this.usuario?.nome ?? '';
    return nome.length > 15 ? nome.slice(0, 15) + '…' : nome;
  }

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }

    this.usuario = this.authService.getUsuario();
  }

  toggleMenu(): void {
    this.collapsed.update(v => !v);
  }

  logout(): void {
    this.dialog.open(ConfirmDialogComponent, {
      width: '360px',
      data: {
        title:        'Sair do sistema',
        message:      'Deseja realmente sair?',
        confirmLabel: 'Sair',
        cancelLabel:  'Cancelar',
      },
    }).afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.authService.logout();
        this.router.navigate(['/login']);
      }
    });
  }
}
