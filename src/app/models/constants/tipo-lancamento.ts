export class TipoLancamento {
  static RECEITA = 'RECEITA';
  static DESPESA  = 'DESPESA';
  static TODOS    = '';

  static get optionsAll() {
    return [
      { name: 'Todos',   value: TipoLancamento.TODOS   },
      { name: 'Receita', value: TipoLancamento.RECEITA },
      { name: 'Despesa', value: TipoLancamento.DESPESA },
    ];
  }

  static get options() {
    return [
      { name: 'Receita', value: TipoLancamento.RECEITA },
      { name: 'Despesa', value: TipoLancamento.DESPESA },
    ];
  }

  static getDescription(tipo: string): string {
    switch (tipo) {
      default:                        return 'Desconhecido';
      case TipoLancamento.RECEITA:    return 'Receita';
      case TipoLancamento.DESPESA:    return 'Despesa';
    }
  }
}
