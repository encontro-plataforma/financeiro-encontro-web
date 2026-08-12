import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FilterStateService {
  private prefix = 'app.filters.';

  save(key: string, state: any): void {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(state));
    } catch (e) {
      // ignore storage errors
    }
  }

  load<T = any>(key: string): T | null {
    try {
      const raw = localStorage.getItem(this.prefix + key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch (e) {
      return null;
    }
  }

  clear(key: string): void {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (e) {}
  }
}
