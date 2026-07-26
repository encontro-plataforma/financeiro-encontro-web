import { MatPaginatorIntl } from '@angular/material/paginator';

function getRangeLabel(page: number, pageSize: number, length: number): string {
  if (length === 0 || pageSize === 0) {
    return `0 de ${length}`;
  }

  const startIndex = page * pageSize;
  const endIndex = startIndex < length
    ? Math.min(startIndex + pageSize, length)
    : startIndex + pageSize;

  return `${startIndex + 1} – ${endIndex} de ${length}`;
}

export function ptBrPaginatorIntl(): MatPaginatorIntl {
  const intl = new MatPaginatorIntl();

  intl.itemsPerPageLabel = 'Itens por página:';
  intl.nextPageLabel = 'Próxima página';
  intl.previousPageLabel = 'Página anterior';
  intl.firstPageLabel = 'Primeira página';
  intl.lastPageLabel = 'Última página';
  intl.getRangeLabel = getRangeLabel;

  return intl;
}
