import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  MaterialGlobalModule,
  MaterialFormsModule,
} from '../../../../shared/modules/material.imports.module';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { ErrorHandlerService } from '../../../../shared/services/error-handler.service';
import { FinalidadeService } from '../../../../services/finalidade.service';
import { TipoLancamento } from '../../../../models/constants/tipo-lancamento';

@Component({
  selector: 'app-finalidades-form',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule, MaterialFormsModule],
  templateUrl: './finalidades-form.component.html',
  styleUrl: './finalidades-form.component.scss',
})
export class FinalidadesFormComponent implements OnInit {
  private fb              = inject(FormBuilder);
  private route           = inject(ActivatedRoute);
  private router          = inject(Router);
  private finalidadeService = inject(FinalidadeService);
  private toast           = inject(ToastService);
  private errorHandler    = inject(ErrorHandlerService);

  form!: FormGroup;
  saving     = false;
  loading    = false;
  updatePage = false;
  finalidadeId: number | null = null;

  readonly tipoOpcoes = TipoLancamento.options;

  ngOnInit(): void {
    this.form = this.fb.group({
      nome:      ['', [Validators.required, Validators.maxLength(100)]],
      tipo:      [TipoLancamento.RECEITA, Validators.required],
      descricao: [''],
    });

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.updatePage  = true;
      this.finalidadeId = Number(id);
      this.loadValues(this.finalidadeId);
    }
  }

  private loadValues(id: number): void {
    this.loading = true;
    this.finalidadeService.buscarPorId(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          nome:      data.nome,
          tipo:      data.tipo,
          descricao: data.descricao ?? '',
        });
        this.loading = false;
      },
      error: (err) => {
        this.errorHandler.handler(err);
        this.loading = false;
        this.voltar();
      },
    });
  }

  voltar(): void {
    this.router.navigate(['/administracao/finalidades']);
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning({ message: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    const { nome, tipo, descricao } = this.form.value;
    const payload = { nome, tipo, descricao: descricao || null };

    this.saving = true;

    const req$ = this.updatePage && this.finalidadeId
      ? this.finalidadeService.editar(this.finalidadeId, payload)
      : this.finalidadeService.criar(payload);

    const msg = this.updatePage
      ? 'Finalidade atualizada com sucesso.'
      : 'Finalidade criada com sucesso.';

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
