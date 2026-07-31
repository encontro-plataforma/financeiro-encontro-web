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
import { EncontristaService } from '../../../../services/encontrista.service';
import { EncontreiroService } from '../../../../services/encontreiro.service';
import { CirculoService } from '../../../../services/circulo.service';
import { Encontrista } from '../../../../models/encontrista.model';
import { Encontreiro } from '../../../../models/encontreiro.model';
import { Circulo } from '../../../../models/circulo.model';

@Component({
  selector: 'app-encontristas-form',
  standalone: true,
  imports: [
    CommonModule,
    MaterialGlobalModule,
    MaterialFormsModule,
    MaterialDatepickerModule,
    AuditadoBadgeComponent,
    VinculoLancamentoComponent,
  ],
  templateUrl: './encontristas-form.component.html',
  styleUrl: './encontristas-form.component.scss',
})
export class EncontristasFormComponent implements OnInit {
  private fb                 = inject(FormBuilder);
  private route              = inject(ActivatedRoute);
  private router             = inject(Router);
  private encontristaService = inject(EncontristaService);
  private encontreiroService = inject(EncontreiroService);
  private circuloService     = inject(CirculoService);
  private toast               = inject(ToastService);
  private errorHandler        = inject(ErrorHandlerService);

  form!: FormGroup;
  saving  = false;
  loading = false;
  encontristaId!: number;
  encontrista: Encontrista | null = null;

  encontreiros: Encontreiro[] = [];
  circulos: Circulo[] = [];

  ngOnInit(): void {
    this.form = this.fb.group({
      dt_entrega:           [null],
      dt_validade:          [null],
      padrinho_id:          [null, Validators.required],
      nome:                 ['', [Validators.required, Validators.maxLength(150)]],
      apelido:              [''],
      dt_nascimento:        [null],
      idade:                [null],
      circulo_id:           [null],
      instagram:            [''],
      contato:              [''],
      religiao:             [''],
      igreja:               [''],
      endereco:             [''],
      cidade:               [''],
      camisa:               [''],
      veiculo:              [''],
      contato_emerg:        [''],
      nome_emerg:           [''],
      parentesco_emerg:     [''],
      medicacao:            [''],
      alergia_comorbidade:  [''],
      carta:                [false],
      album:                [false],
      blusa:                [false],
      dt_pagamento:         [null],
      nome_pagador:         [''],
      pagamento:            [null],
      observacao:           [''],
    });

    this.encontristaId = Number(this.route.snapshot.params['id']);

    this.encontreiroService.listAll().subscribe((encontreiros) => (this.encontreiros = encontreiros));
    this.circuloService.listAll().subscribe((circulos) => (this.circulos = circulos));

    this.loadValues();
  }

  private loadValues(): void {
    this.loading = true;
    this.encontristaService.buscarPorId(this.encontristaId).subscribe({
      next: (data) => {
        this.encontrista = data;
        this.form.patchValue({
          ...data,
          dt_entrega:    data.dt_entrega ? moment(data.dt_entrega) : null,
          dt_validade:   data.dt_validade ? moment(data.dt_validade) : null,
          dt_nascimento: data.dt_nascimento ? moment(data.dt_nascimento) : null,
          dt_pagamento:  data.dt_pagamento ? moment(data.dt_pagamento) : null,
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
      this.router.navigate(['/secretaria/encontristas']);
    }
  }

  private buildPayload() {
    const { dt_entrega, dt_validade, dt_nascimento, dt_pagamento, ...rest } = this.form.value;
    return {
      ...rest,
      dt_entrega:    dt_entrega ? moment(dt_entrega).format('YYYY-MM-DD') : null,
      dt_validade:   dt_validade ? moment(dt_validade).format('YYYY-MM-DD') : null,
      dt_nascimento: dt_nascimento ? moment(dt_nascimento).format('YYYY-MM-DD') : null,
      dt_pagamento:  dt_pagamento ? moment(dt_pagamento).format('YYYY-MM-DD') : null,
    };
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning({ message: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    this.saving = true;
    this.encontristaService.editar(this.encontristaId, this.buildPayload()).subscribe({
      next: () => {
        this.toast.success({ message: 'Encontrista atualizado com sucesso.' });
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
