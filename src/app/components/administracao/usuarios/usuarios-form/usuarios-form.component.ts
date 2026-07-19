import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  MaterialGlobalModule,
  MaterialFormsModule,
} from '../../../../shared/modules/material.imports.module';
import { ToastService }      from '../../../../shared/components/toast/toast.service';
import { ErrorHandlerService } from '../../../../shared/services/error-handler.service';
import { UsuarioService }    from '../../../../services/usuario.service';
import { PerfilUsuario }            from '../../../../models/constants/perfil';

@Component({
  selector: 'app-usuarios-form',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule, MaterialFormsModule],
  templateUrl: './usuarios-form.component.html',
  styleUrl: './usuarios-form.component.scss',
})
export class UsuariosFormComponent implements OnInit {
  private fb             = inject(FormBuilder);
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private usuarioService = inject(UsuarioService);
  private toast          = inject(ToastService);
  private errorHandler   = inject(ErrorHandlerService);

  form!: FormGroup;
  saving     = false;
  loading    = false;
  updatePage = false;
  readonlyAdmin = false;
  usuarioId: number | null = null;
  senhaVisivel = false;

  readonly perfilOpcoes = PerfilUsuario.options;

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.updatePage = !!id;
    this.usuarioId = id ? Number(id) : null;
    this.readonlyAdmin = this.updatePage && this.usuarioId === 1;

    this.form = this.fb.group(
      {
        nome: ['',[Validators.required, Validators.maxLength(50)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(50)]],
        perfil: [PerfilUsuario.CONCILIADOR, Validators.required],
        senha: ['', [Validators.maxLength(12)]],
        senhaConfirmacao: ['', [Validators.maxLength(12)]],
        ativo: [true],
      },
      { validators: this.senhaMatchValidator.bind(this) },
    );

    if (!this.updatePage) {
      this.form.get('senha')!.setValidators([Validators.required, Validators.maxLength(12)]);
      this.form.get('senhaConfirmacao')!.setValidators([Validators.required, Validators.maxLength(12)]);
      this.form.get('senha')!.updateValueAndValidity();
      this.form.get('senhaConfirmacao')!.updateValueAndValidity();
    }

    if (this.readonlyAdmin) {
      this.form.disable({ emitEvent: false, onlySelf: true });
    }

    if (this.updatePage && this.usuarioId) {
      this.loadValues(this.usuarioId);
    }
  }

  private loadValues(id: number): void {
    this.loading = true;
    this.usuarioService.buscarPorId(id).subscribe({
      next: (data) => {
        this.form.patchValue({ nome: data.nome, email: data.email, ativo: data.ativo, perfil: data.perfil });
        this.loading = false;
      },
      error: (err) => {
        this.errorHandler.handler(err);
        this.loading = false;
        this.voltar();
      },
    });
  }

  private senhaMatchValidator(group: FormGroup) {
    const senha = group.get('senha')?.value;
    const senhaConfirmacao = group.get('senhaConfirmacao')?.value;

    if (!senha && !this.updatePage) {
      group.get('senhaConfirmacao')?.setErrors({ required: true });
      return { senhaMismatch: true };
    }

    if (senha && senhaConfirmacao !== senha) {
      group.get('senhaConfirmacao')?.setErrors({ senhaMismatch: true });
      return { senhaMismatch: true };
    }

    const confirmControl = group.get('senhaConfirmacao');
    if (confirmControl?.hasError('senhaMismatch')) {
      confirmControl.setErrors(null);
    }

    return null;
  }

  voltar(): void {
    this.router.navigate(['/administracao/usuarios']);
  }

  salvar(): void {
    if (this.readonlyAdmin) {
      this.toast.warning({ message: 'O usuário administrador não pode ser alterado.' });
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning({ message: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    const { nome, email, senha, perfil, ativo } = this.form.value;
    this.saving = true;

    const payload: any = { nome, email, perfil, ativo };
    if (senha) {
      payload.senha = senha;
    }

    const req$ = this.updatePage && this.usuarioId
      ? this.usuarioService.editar(this.usuarioId, payload)
      : this.usuarioService.criar(payload);

    const msg = this.updatePage ? 'Usuário atualizado com sucesso.' : 'Usuário criado com sucesso.';

    req$.subscribe({
      next: () => {
        this.toast.success({ message: msg });
        this.saving = false;
        this.voltar();
      },
      error: (err) => {
        this.errorHandler.handler(err);
        this.saving = false;
      },
    });
  }
}
