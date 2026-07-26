import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, inject } from '@angular/core';
import { AsyncPipe }           from '@angular/common';
import { MatIconModule }       from '@angular/material/icon';
import { MatButtonModule }     from '@angular/material/button';
import { Subscription } from 'rxjs';
import { ToastService, ToastType } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [AsyncPipe, MatIconModule, MatButtonModule],
  templateUrl: './toast.component.html',
  styleUrl:    './toast.component.scss',
})
export class ToastComponent implements AfterViewInit, OnDestroy {
  toastSvc = inject(ToastService);

  @ViewChild('popoverEl') private popoverEl!: ElementRef<HTMLElement>;
  private sub!: Subscription;
  private isOpen = false;
  private lastCount = 0;

  ngAfterViewInit(): void {
    // Dialogs/menus no Angular CDK 21 usam a Popover API do navegador (top layer),
    // que sempre pinta acima de qualquer z-index comum — o toast precisa entrar
    // no mesmo top layer para conseguir aparecer/ser clicável na frente deles.
    // Reabrir o popover a cada novo toast (mesmo se já estiver aberto) o promove
    // para o topo da pilha do top layer, garantindo que fique à frente mesmo se
    // um dialog tiver sido aberto depois que o toast já estava visível.
    this.sub = this.toastSvc.toasts$.subscribe((toasts) => {
      const el = this.popoverEl.nativeElement;
      const isNewToast = toasts.length > this.lastCount;
      this.lastCount = toasts.length;

      if (toasts.length > 0 && (!this.isOpen || isNewToast)) {
        if (this.isOpen) el.hidePopover();
        el.showPopover();
        this.isOpen = true;
      } else if (toasts.length === 0 && this.isOpen) {
        el.hidePopover();
        this.isOpen = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  iconOf(type: ToastType): string {
    const map: Record<ToastType, string> = {
      [ToastType.SUCCESS]: 'check_circle',
      [ToastType.ERROR]:   'error',
      [ToastType.WARNING]: 'warning',
    };
    return map[type] ?? 'info';
  }
}
