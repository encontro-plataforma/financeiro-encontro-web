import { calcularSaldoPendente, calcularValorMaximoVinculo, podeAdicionarVinculo } from './vinculo.utils';

describe('calcularSaldoPendente', () => {
  it('retorna null quando não há pagamento definido', () => {
    expect(calcularSaldoPendente(null, 0)).toBeNull();
  });

  it('retorna zero quando o total vinculado já cobre o pagamento', () => {
    expect(calcularSaldoPendente(100, 100)).toBe(0);
  });

  it('retorna zero quando o total vinculado ultrapassa o pagamento', () => {
    expect(calcularSaldoPendente(100, 120)).toBe(0);
  });

  it('retorna o restante quando o pagamento é parcial', () => {
    expect(calcularSaldoPendente(100, 60)).toBe(40);
  });

  it('retorna o pagamento inteiro quando nada foi vinculado ainda', () => {
    expect(calcularSaldoPendente(100, 0)).toBe(100);
  });
});

describe('calcularValorMaximoVinculo', () => {
  it('usa o restante do lançamento quando o saldo da pessoa é null (pagamento indefinido)', () => {
    expect(calcularValorMaximoVinculo(50, null)).toBe(50);
  });

  it('usa o menor valor entre restante do lançamento e saldo da pessoa', () => {
    expect(calcularValorMaximoVinculo(100, 40)).toBe(40);
    expect(calcularValorMaximoVinculo(30, 40)).toBe(30);
  });
});

describe('podeAdicionarVinculo', () => {
  it('permite adicionar quando o pagamento é indefinido (saldo null)', () => {
    expect(podeAdicionarVinculo(null)).toBe(true);
  });

  it('permite adicionar quando o saldo pendente está acima da tolerância', () => {
    expect(podeAdicionarVinculo(0.02)).toBe(true);
  });

  it('bloqueia quando o saldo pendente está dentro da tolerância de R$0,01', () => {
    expect(podeAdicionarVinculo(0.01)).toBe(false);
  });

  it('bloqueia quando não há saldo pendente', () => {
    expect(podeAdicionarVinculo(0)).toBe(false);
  });
});
