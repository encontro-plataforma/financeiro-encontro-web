const TOLERANCIA = 0.01;

/** Espelha app/services/vinculo_pessoa_service.calcular_saldo_pendente no backend. */
export function calcularSaldoPendente(pagamento: number | null, totalVinculado: number): number | null {
  if (pagamento === null) return null;
  const resto = pagamento - totalVinculado;
  return resto > 0 ? resto : 0;
}

/** Teto efetivo pra um novo vínculo: o menor entre o que ainda resta no
 *  lançamento escolhido e o saldo pendente da pessoa. */
export function calcularValorMaximoVinculo(
  restanteLancamento: number,
  saldoPendentePessoa: number | null,
): number {
  if (saldoPendentePessoa === null) return restanteLancamento;
  return Math.min(restanteLancamento, saldoPendentePessoa);
}

/** Só permite adicionar outro vínculo enquanto sobrar mais que a tolerância
 *  de R$0,01 (mesma tolerância usada pelo backend). */
export function podeAdicionarVinculo(saldoPendente: number | null, tolerancia: number = TOLERANCIA): boolean {
  return saldoPendente === null || saldoPendente > tolerancia;
}
