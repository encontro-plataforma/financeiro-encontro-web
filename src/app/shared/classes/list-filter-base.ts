import { inject } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { FilterStateService } from '../../services/filter-state.service';

export abstract class ListFilterBase {
  protected filterState = inject(FilterStateService);
  protected filterKey = '';
  pageIndex = 0;
  pageSize = 10;

  protected initFilter(key: string, restoreFn?: (saved: any) => void): void {
    this.filterKey = key;
    const saved = this.filterState.load<any>(key);
    if (saved && restoreFn) {
      try {
        restoreFn(saved);
        this.pageIndex = saved.pageIndex ?? this.pageIndex;
        this.pageSize = saved.pageSize ?? this.pageSize;
      } catch (e) {
        // ignore
      }
    }
  }

  protected saveState(state: any): void {
    if (!this.filterKey) return;
    this.filterState.save(this.filterKey, {
      ...state,
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
    });
  }

  protected handlePage(event: PageEvent, stateProvider?: () => any, after?: () => void): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    if (stateProvider) this.saveState(stateProvider());
    if (after) after();
  }
}
