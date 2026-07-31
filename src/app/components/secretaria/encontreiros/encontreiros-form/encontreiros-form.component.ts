import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';

import {
  MaterialGlobalModule,
  MaterialFormsModule,
  MaterialDatepickerModule,
} from '../../../../shared/modules/material.imports.module';
import { AuditadoBadgeComponent } from '../../../../shared/components/auditado-badge/auditado-badge.component';
import { VinculoLancamentoComponent } from '../../../../shared/components/vinculo-lancamento/vinculo-lancamento.component';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { ErrorHandlerService } from '../../../../shared/services/error-handler.service';
import { EncontreiroService } from '../../../../services/encontreiro.service';
import { EquipeService } from '../../../../services/equipe.service';
import { Encontreiro } from '../../../../models/encontreiro.model';
import { Equipe } from '../../../../models/equipe.model';
import { SituacaoCamisa } from '../../../../models/constants/situacao-camisa';

@Component({
  selector: 'app-encontreiros-form',
  standalone: true,
  imports: [
    CommonModule,
    MaterialGlobalModule,
    MaterialFormsModule,
    MaterialDatepickerModule,
    AuditadoBadgeComponent,
    VinculoLancamentoComponent,
  ],
  templateUrl: './encontreiros-form.component.html',
  styleUrl: './encontreiros-form.component.scss',
})
export class EncontreirosFormComponent implements OnInit {
  private fb                 = inject(FormBuilder);
  private route              = inject(ActivatedRoute);
  private router             = inject(Router);
  private encontreiroService = inject(EncontreiroService);
  private equipeService      = inject(EquipeService);
  private toast              = inject(ToastService);
  private errorHandler       = inject(ErrorHandlerService);

  form!: FormGroup;
  saving  = false;
  loading = false;
  encontreiroId!: number;
  encontreiro: Encontreiro | null = null;

  equipes: Equipe[] = [];
  readonly situacaoOpcoes = SituacaoCamisa.options;

  ngOnInit(): void {
    this.form = this.fb.group({
      dt_inscricao:        [null],
      nome:                ['', [Validators.required, Validators.maxLength(150)]],
      apelido:             [''],
      instagram:           [''],
      telefone:            [''],
      estado_civil:        [''],
      igreja:              [''],
      religiao:            [''],
      equipe_id:           [null, Validators.required],
      camisa:              [''],
      situacao_camisa:     [SituacaoCamisa.SEM_BLUSA],
      veiculo:             [''],
      contato_emerg:       [''],
      nome_emerg:          [''],
      parentesco_emerg:    [''],
      alergia_comorbidade: [''],
      dt_pagamento:        [null],
      nome_pagador:        [''],
      pagamento:           [null],
      observacao:          [''],
    });

    this.encontreiroId = Number(this.route.snapshot.params['id']);

    this.equipeService.listAll().subscribe((equipes) => (this.equipes = equipes));

    this.loadValues();
  }

  private loadValues(): void {
    this.loading = true;
    this.encontreiroService.buscarPorId(this.encontreiroId).subscribe({
      next: (data) => {
        this.encontreiro = data;
        this.form.patchValue({
          ...data,
          dt_inscricao: data.dt_inscricao ? moment(data.dt_inscricao) : null,
          dt_pagamento: data.dt_pagamento ? moment(data.dt_pagamento) : null,
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

  onVinculoAlterado(): void {
    this.loadValues();
  }

  voltar(): void {
    const returnUrl: string | undefined = window.history.state?.returnUrl;
    if (returnUrl) {
      this.router.navigateByUrl(returnUrl);
    } else {
      this.router.navigate(['/secretaria/encontreiros']);
    }
  }

  private buildPayload() {
    const { dt_inscricao, dt_pagamento, ...rest } = this.form.value;
    return {
      ...rest,
      dt_inscricao: dt_inscricao ? moment(dt_inscricao).format('YYYY-MM-DD') : null,
      dt_pagamento: dt_pagamento ? moment(dt_pagamento).format('YYYY-MM-DD') : null,
    };
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning({ message: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    this.saving = true;
    this.encontreiroService.editar(this.encontreiroId, this.buildPayload()).subscribe({
      next: () => {
        this.toast.success({ message: 'Encontreiro atualizado com sucesso.' });
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
