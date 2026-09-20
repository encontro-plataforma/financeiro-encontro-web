export class FormaPagamento {
  static PIX            = 'PIX';
  static DINHEIRO       = 'DINHEIRO';
  static CARTAO_CREDITO = 'CARTAO_CREDITO';
  static CARTAO_DEBITO  = 'CARTAO_DEBITO';
  static TODOS          = '';

  static get optionsAll() {
    return [
      { name: 'Todas',             value: FormaPagamento.TODOS          },
      { name: 'Pix',               value: FormaPagamento.PIX            },
      { name: 'Dinheiro',          value: FormaPagamento.DINHEIRO       },
      { name: 'Cartão de Crédito', value: FormaPagamento.CARTAO_CREDITO },
      { name: 'Cartão de Débito',  value: FormaPagamento.CARTAO_DEBITO  },
    ];
  }

  static get options() {
    return [
      { name: 'Pix',               value: FormaPagamento.PIX            },
      { name: 'Dinheiro',          value: FormaPagamento.DINHEIRO       },
      { name: 'Cartão de Crédito', value: FormaPagamento.CARTAO_CREDITO },
      { name: 'Cartão de Débito',  value: FormaPagamento.CARTAO_DEBITO  },
    ];
  }

  static getDescription(forma: string): string {
    switch (forma) {
      default:                               return 'Desconhecido';
      case FormaPagamento.PIX:               return 'Pix';
      case FormaPagamento.DINHEIRO:          return 'Dinheiro';
      case FormaPagamento.CARTAO_CREDITO:    return 'Cartão de Crédito';
      case FormaPagamento.CARTAO_DEBITO:     return 'Cartão de Débito';
    }
  }

  /** Igual a `getDescription`, mas acrescenta "(em Nx)" para cartão de
   * crédito parcelado em mais de 1x (débito não tem parcelas). */
  static getDescriptionComParcelas(forma: string, parcelas: number | null | undefined): string {
    const descricao = FormaPagamento.getDescription(forma);
    if (forma === FormaPagamento.CARTAO_CREDITO && parcelas && parcelas > 1) {
      return `${descricao} (em ${parcelas}x)`;
    }
    return descricao;
  }
}
