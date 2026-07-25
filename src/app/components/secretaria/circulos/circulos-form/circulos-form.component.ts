import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import {
  MaterialGlobalModule,
  MaterialFormsModule,
} from '../../../../shared/modules/material.imports.module';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { ErrorHandlerService } from '../../../../shared/services/error-handler.service';
import { CirculoService } from '../../../../services/circulo.service';

@Component({
  selector: 'app-circulos-form',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule, MaterialFormsModule],
  templateUrl: './circulos-form.component.html',
  styleUrl: './circulos-form.component.scss',
})
export class CirculosFormComponent implements OnInit {
  @ViewChild('colorInput') colorInputRef!: ElementRef<HTMLInputElement>;

  private fb             = inject(FormBuilder);
  private route          = inject(ActivatedRoute);
  private router         = inject(Router);
  private circuloService = inject(CirculoService);
  private toast          = inject(ToastService);
  private errorHandler   = inject(ErrorHandlerService);

  form!: FormGroup;
  saving     = false;
  loading    = false;
  updatePage = false;
  circuloId: number | null = null;

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      rgb:  ['#980000', Validators.required],
    });

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.updatePage = true;
      this.circuloId  = Number(id);
      this.loadValues(this.circuloId);
    }
  }

  private loadValues(id: number): void {
    this.loading = true;
    this.circuloService.buscarPorId(id).subscribe({
      next: (data) => {
        this.form.patchValue({
          nome: data.nome,
          rgb:  data.rgb,
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

  abrirSeletorCor(): void {
    this.colorInputRef.nativeElement.click();
  }

  onCorSelecionada(event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.form.patchValue({ rgb: valor });
  }

  voltar(): void {
    this.router.navigate(['/secretaria/circulos']);
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.warning({ message: 'Preencha todos os campos obrigatórios.' });
      return;
    }

    const payload = this.form.value;
    this.saving = true;

    const req$ = this.updatePage && this.circuloId
      ? this.circuloService.editar(this.circuloId, payload)
      : this.circuloService.criar(payload);

    const msg = this.updatePage
      ? 'Círculo atualizado com sucesso.'
      : 'Círculo criado com sucesso.';

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
