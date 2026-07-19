import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

export interface MultiSelectItem {
  id: string | number;
  label: string;
}

@Component({
  selector: 'app-multi-select',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatSelectModule, MatIconModule],
  templateUrl: './multi-select.component.html',
  styleUrl: './multi-select.component.scss',
})
export class MultiSelectComponent implements OnChanges {
  @Input() items: MultiSelectItem[] = [];
  @Input() selectedIds: (string | number)[] = [];
  @Input() label = 'Selecione';
  @Output() selectionChange = new EventEmitter<(string | number)[]>();

  searchText = '';
  visibleIds = new Set<string | number>();

  ngOnChanges(): void {
    this.updateVisible();
  }

  updateVisible(): void {
    const search = this.searchText.toLowerCase().trim();
    this.visibleIds = new Set(
      search
        ? this.items.filter(i => i.label.toLowerCase().includes(search)).map(i => i.id)
        : this.items.map(i => i.id)
    );
  }

  get hasVisibleItems(): boolean {
    return this.visibleIds.size > 0;
  }

  isVisible(id: string | number): boolean {
    return this.visibleIds.has(id);
  }

  getLabelById(id: string | number): string {
    return this.items.find(i => i.id === id)?.label ?? String(id);
  }

  onSelectionChange(values: (string | number)[]): void {
    this.selectionChange.emit(values);
  }

  onPanelOpenChange(isOpen: boolean): void {
    if (!isOpen) {
      this.searchText = '';
      this.updateVisible();
    }
  }

  clearSearch(): void {
    this.searchText = '';
    this.updateVisible();
  }

  clearAll(event: Event): void {
    event.stopPropagation();
    this.selectionChange.emit([]);
  }
}
