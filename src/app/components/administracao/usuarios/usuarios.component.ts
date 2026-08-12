import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  AfterViewInit,
  ViewEncapsulation,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';

import {
  MaterialGlobalModule,
  MaterialFormsModule,
} from '../../../shared/modules/material.imports.module';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { Usuario } from '../../../models/usuario.model';
import { PerfilUsuario } from '../../../models/constants/perfil';
import { PageTemplate } from '../../../services/util/PageTemplate';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ListFilterBase } from '../../../shared/classes/list-filter-base';

const ADMIN_ID = 1;

@Component({
  selector: 'app-usuarios',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, FormsModule, MaterialGlobalModule, MaterialFormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.scss',
})
export class UsuariosComponent extends ListFilterBase implements OnInit, AfterViewInit {
  private usuarioService = inject(UsuarioService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private toast = inject(ToastService);
  private cdr = inject(ChangeDetectorRef);

  result: PageTemplate<Usuario> = new PageTemplate<Usuario>();
  loading = false;

  currentUserId = this.authService.getUsuario()?.id ?? -1;

  displayedColumns = ['nome', 'email', 'perfil', 'status', 'acoes'];

  search = '';
  statusFiltro: string = '';
  perfilFiltro: string = '';

  readonly PerfilUsuario = PerfilUsuario;

  private searchSubject = new Subject<string>();

  ngOnInit(): void {
    this.initFilter('usuarios', (saved) => {
      this.search = saved.search ?? this.search;
      this.statusFiltro = saved.statusFiltro ?? this.statusFiltro;
      this.perfilFiltro = saved.perfilFiltro ?? this.perfilFiltro;
    });

    this.searchSubject.pipe(debounceTime(300), distinctUntilChanged()).subscribe(() => {
      this.pageIndex = 0;
      this.saveState({
        search: this.search,
        statusFiltro: this.statusFiltro,
        perfilFiltro: this.perfilFiltro,
      });
      this.load();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.load());
  }

  load(): void {
    this.loading = true;

    const request = {
      ...(this.search ? { nomeOrEmail: this.search } : {}),
      ...(this.statusFiltro !== '' ? { ativo: this.statusFiltro === 'true' ? true : false } : {}),
      ...(this.perfilFiltro ? { perfil: this.perfilFiltro } : {}),
    };

    this.usuarioService
      .list(request, { skip: this.pageIndex * this.pageSize, limit: this.pageSize })
      .subscribe({
        next: (data) => {
          this.result = data;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.search);
  }

  onStatusChange(): void {
    this.pageIndex = 0;
    this.saveState({
      search: this.search,
      statusFiltro: this.statusFiltro,
      perfilFiltro: this.perfilFiltro,
    });
    this.load();
  }

  onPerfilChange(): void {
    this.pageIndex = 0;
    this.saveState({
      search: this.search,
      statusFiltro: this.statusFiltro,
      perfilFiltro: this.perfilFiltro,
    });
    this.load();
  }

  onPage(event: PageEvent): void {
    this.handlePage(
      event,
      () => ({
        search: this.search,
        statusFiltro: this.statusFiltro,
        perfilFiltro: this.perfilFiltro,
      }),
      () => this.load(),
    );
  }

  criar(): void {
    this.router.navigate(['/administracao/usuarios/novo']);
  }
  editar(id: number): void {
    this.router.navigate(['/administracao/usuarios', id, 'editar']);
  }

  podeDeletar(usuario: Usuario): boolean {
    return usuario.id !== ADMIN_ID && usuario.id !== this.currentUserId;
  }

  deletar(usuario: Usuario): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        data: {
          title: 'Confirmar exclusão',
          message: `Deseja excluir o usuário "${usuario.nome}"? Esta ação não pode ser desfeita.`,
        },
      })
      .afterClosed()
      .subscribe((ok: boolean) => {
        if (!ok) return;
        this.usuarioService.remover(usuario.id).subscribe({
          next: () => {
            this.toast.success({ message: 'Usuário excluído com sucesso.' });
            if (this.result.items.length === 1 && this.pageIndex > 0) this.pageIndex--;
            this.load();
          },
          error: (err) =>
            this.toast.error({ message: err?.error?.detail ?? 'Erro ao excluir usuário.' }),
        });
      });
  }
}
