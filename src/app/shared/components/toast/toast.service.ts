import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export enum ToastType {
  SUCCESS = 'success',
  ERROR   = 'error',
  WARNING = 'warning',
}

export enum ToastDuration {
  SHORT   = 3000,
  DEFAULT = 5000,
  LONG    = 7000,
  ALWAYS  = 0,
}

export interface ToastOptions {
  message:   string;
  duration?: ToastDuration;
}

export interface ToastMessage {
  id:       number;
  type:     ToastType;
  message:  string;
  duration: ToastDuration;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _counter = 0;
  readonly toasts$ = new BehaviorSubject<ToastMessage[]>([]);

  success(options: ToastOptions): void { this._add(ToastType.SUCCESS, options); }
  warning(options: ToastOptions): void { this._add(ToastType.WARNING, options); }
  error(options: ToastOptions):   void { 
    if(options.duration === undefined){
      options.duration = ToastDuration.ALWAYS;
    }
    this._add(ToastType.ERROR,   options); 
}

  dismiss(id: number): void {
    this.toasts$.next(this.toasts$.value.filter(t => t.id !== id));
  }

  private _add(type: ToastType, options: ToastOptions): void {
    const id       = ++this._counter;
    const duration = options.duration ?? ToastDuration.DEFAULT;
    this.toasts$.next([...this.toasts$.value, { id, type, message: options.message, duration }]);
    if (duration !== ToastDuration.ALWAYS) {
      setTimeout(() => this.dismiss(id), duration);
    }
  }
}
