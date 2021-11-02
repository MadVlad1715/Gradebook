import { MatPaginatorIntl } from '@angular/material/paginator';

const ukraineRangeLabel = (page: number, pageSize: number, length: number) => {
  if (length == 0 || pageSize == 0) { return `0 van ${length}`; }

  length = Math.max(length, 0);

  const startIndex = page * pageSize;

  const endIndex = startIndex < length ?
    Math.min(startIndex + pageSize, length) :
    startIndex + pageSize;

  return `${startIndex + 1} - ${endIndex} із ${length}`;
}


export function getUkPaginatorIntl() {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.itemsPerPageLabel = 'Елементів на сторінці:';
  paginatorIntl.nextPageLabel = 'Наступна сторінка';
  paginatorIntl.previousPageLabel = 'Попередня сторінка';
  paginatorIntl.getRangeLabel = ukraineRangeLabel;

  return paginatorIntl;
}
