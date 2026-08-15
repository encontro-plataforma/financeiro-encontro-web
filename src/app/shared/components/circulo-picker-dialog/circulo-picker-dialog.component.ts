import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { MaterialGlobalModule } from '../../modules/material.imports.module';
import { CirculoService } from '../../../services/circulo.service';
import { Circulo } from '../../../models/circulo.model';

export interface CirculoPickerDialogData {
  circuloAtualId?: number | null;
}

@Component({
  selector: 'app-circulo-picker-dialog',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule],
  templateUrl: './circulo-picker-dialog.component.html',
  styleUrl: './circulo-picker-dialog.component.scss',
})
export class CirculoPickerDialogComponent implements OnInit {
  private circuloService = inject(CirculoService);
  private dialogRef = inject(MatDialogRef<CirculoPickerDialogComponent, Circulo>);
  data: CirculoPickerDialogData = inject(MAT_DIALOG_DATA, { optional: true }) ?? {};
  cdr = inject(ChangeDetectorRef);

  loading = false;
  circulos: Circulo[] = [];

  ngOnInit(): void {
    this.loading = true;
    this.circuloService.listAll().subscribe({
      next: (circulos) => {
        this.circulos = circulos;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  selecionar(circulo: Circulo): void {
    this.dialogRef.close(circulo);
  }

  // id 0 é o sentinela de "Sem Círculo" -- mesma convenção já usada no
  // filtro de círculo da listagem (SEM_CIRCULO_ID), tratado no backend
  // como circulo_id = NULL.
  selecionarSemCirculo(): void {
    this.dialogRef.close({ id: 0, nome: 'Sem Círculo', rgb: '' });
  }

  cancelar(): void {
    this.dialogRef.close();
  }
}
