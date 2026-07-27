import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialGlobalModule } from '../../modules/material.imports.module';
import { UploadResumoItem } from '../../../models/upload-file.model';

@Component({
  selector: 'app-upload-totais-cards',
  standalone: true,
  imports: [CommonModule, MaterialGlobalModule],
  templateUrl: './upload-totais-cards.component.html',
  styleUrl: './upload-totais-cards.component.scss',
})
export class UploadTotaisCardsComponent {
  @Input() totais: UploadResumoItem[] = [];
}
