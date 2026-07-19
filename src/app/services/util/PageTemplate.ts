export class PageTemplate<M = any> {
  items: M[]    = [];
  total: number = 0;
  page:  number = 1;
  size:  number = 10;

  get totalPages(): number { return Math.ceil(this.total / this.size); }
  get hasNext():    boolean { return this.page < this.totalPages; }
  get hasPrev():    boolean { return this.page > 1; }
}

export interface PageRequest {
  skip?:  number;
  limit?: number;
  sort?:  string[];
}
