import { Component, inject }  from '@angular/core';
import { AsyncPipe }           from '@angular/common';
import { MatIconModule }       from '@angular/material/icon';
import { MatButtonModule }     from '@angular/material/button';
import { ToastService, ToastType } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [AsyncPipe, MatIconModule, MatButtonModule],
  templateUrl: './toast.component.html',
  styleUrl:    './toast.component.scss',
})
export class ToastComponent {
  toastSvc = inject(ToastService);

  iconOf(type: ToastType): string {
    const map: Record<ToastType, string> = {
      [ToastType.SUCCESS]: 'check_circle',
      [ToastType.ERROR]:   'error',
      [ToastType.WARNING]: 'warning',
    };
    return map[type] ?? 'info';
  }
}
