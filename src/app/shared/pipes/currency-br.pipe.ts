import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe }       from '@angular/common';

@Pipe({ name: 'currencyBR', standalone: true })
export class CurrencyBRPipe implements PipeTransform {
  private currency = new CurrencyPipe('pt-BR');

  transform(value: number | null | undefined): string {
    return this.currency.transform(value, 'BRL', 'symbol', '1.2-2', 'pt-BR') ?? '';
  }
}
