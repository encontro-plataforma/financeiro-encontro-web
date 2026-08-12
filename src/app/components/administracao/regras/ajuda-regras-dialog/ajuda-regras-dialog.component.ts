import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { MaterialGlobalModule } from '../../../../shared/modules/material.imports.module';

/** Dialog só informativo — explica o conceito de Grupo/Regra/Condição da tela
 * de Regras e o que cada botão faz. Sem MAT_DIALOG_DATA porque o conteúdo é
 * sempre o mesmo, não depende de contexto. */
@Component({
  selector: 'app-ajuda-regras-dialog',
  standalone: true,
  imports: [MaterialGlobalModule],
  templateUrl: './ajuda-regras-dialog.component.html',
  styleUrl: './ajuda-regras-dialog.component.scss',
})
export class AjudaRegrasDialogComponent {
  private ref = inject(MatDialogRef<AjudaRegrasDialogComponent>);

  fechar(): void {
    this.ref.close();
  }
}
