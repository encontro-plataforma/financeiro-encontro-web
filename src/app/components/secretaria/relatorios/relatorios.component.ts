import { Component } from '@angular/core';

import { MaterialGlobalModule } from '../../../shared/modules/material.imports.module';

@Component({
  selector: 'app-secretaria-relatorios',
  standalone: true,
  imports: [MaterialGlobalModule],
  templateUrl: './relatorios.component.html',
  styleUrl: './relatorios.component.scss',
})
export class SecretariaRelatoriosComponent {}
