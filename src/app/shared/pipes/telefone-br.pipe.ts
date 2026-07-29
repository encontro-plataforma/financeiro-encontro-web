import { Pipe, PipeTransform } from '@angular/core';

/** Formata pra (##) # #### #### quando o valor tem exatamente 11 dígitos; caso
 * contrário devolve o valor original sem alteração. */
@Pipe({ name: 'telefoneBR', standalone: true })
export class TelefoneBrPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';

    const digitos = value.replace(/\D/g, '');
    if (digitos.length !== 11) return value;

    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 3)} ${digitos.slice(3, 7)} ${digitos.slice(7)}`;
  }
}
