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
import { EquipeService } from '../../../../services/equipe.service';
import { AcessoEquipe } from '../../../../models/constants/acesso-equipe';

@Component({
  selector: 'app-equipes-form',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule, MaterialFormsModule],
  templateUrl: './equipes-form.component.html',
  styleUrl: './equipes-form.component.scss',
})
export class EquipesFormComponent implements OnInit {
  private fb            = inject(FormBuilder);
  private route         = inject(ActivatedRoute);
  private router        = inject(Router);
  private equipeService = inject(EquipeService);
  private toast         = inject(ToastService);
  private errorHandler  = inject(ErrorHandlerService);

  form!: FormGroup;
  saving     = false;
  loading    = false;
  updatePage = false;
  equipeId: number | null = null;

  readonly acessoOpcoes = AcessoEquipe.options;

  ngOnInit(): void {
    this.form = this.fb.group({
      nome:   ['', [Validators.required, Validators.maxLength(100)]],
      acesso: [AcessoEquipe.VERMELHO, Validators.required],
    });

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.updatePage = true;
      this.equipeId   = Number(id);
      this.loadValues(this.equipeId);
    }
  }

  private loadValues(id: number): void {
    this.loading = true;
    this.equipeService.buscarPorId(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          nome:   data.nome,
          acesso: data.acesso,
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
    this.router.navigate(['/secretaria/equipes']);
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning({ message: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    const payload = this.form.value;
    this.saving = true;

    const req$ = this.updatePage && this.equipeId
      ? this.equipeService.editar(this.equipeId, payload)
      : this.equipeService.criar(payload);

    const msg = this.updatePage
      ? 'Equipe atualizada com sucesso.'
      : 'Equipe criada com sucesso.';

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
