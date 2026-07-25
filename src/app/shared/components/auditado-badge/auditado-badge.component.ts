import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auditado-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="auditado-badge" [class.auditado-badge--sim]="auditado" [class.auditado-badge--nao]="!auditado">
      {{ auditado ? 'Sim' : 'Não' }}
    </span>
  `,
  styleUrl: './auditado-badge.component.scss',
})
export class AuditadoBadgeComponent {
  @Input() auditado = false;
}
