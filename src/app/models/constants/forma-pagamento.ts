export class FormaPagamento {
  static PIX            = 'PIX';
  static DINHEIRO       = 'DINHEIRO';
  static CARTAO_CREDITO = 'CARTAO_CREDITO';
  static CARTAO_DEBITO  = 'CARTAO_DEBITO';
  static ISENCAO        = 'ISENCAO';
  static TODOS          = '';

  static get optionsAll() {
    return [
      { name: 'Todas',             value: FormaPagamento.TODOS          },
      { name: 'Pix',               value: FormaPagamento.PIX            },
      { name: 'Dinheiro',          value: FormaPagamento.DINHEIRO       },
      { name: 'Cartão de Crédito', value: FormaPagamento.CARTAO_CREDITO },
      { name: 'Cartão de Débito',  value: FormaPagamento.CARTAO_DEBITO  },
      { name: 'Isenção',           value: FormaPagamento.ISENCAO        },
    ];
  }

  static get options() {
    return [
      { name: 'Pix',               value: FormaPagamento.PIX            },
      { name: 'Dinheiro',          value: FormaPagamento.DINHEIRO       },
      { name: 'Cartão de Crédito', value: FormaPagamento.CARTAO_CREDITO },
      { name: 'Cartão de Débito',  value: FormaPagamento.CARTAO_DEBITO  },
      { name: 'Isenção',           value: FormaPagamento.ISENCAO        },
    ];
  }

  static getDescription(forma: string): string {
    switch (forma) {
      default:                               return 'Desconhecido';
      case FormaPagamento.PIX:               return 'Pix';
      case FormaPagamento.DINHEIRO:          return 'Dinheiro';
      case FormaPagamento.CARTAO_CREDITO:    return 'Cartão de Crédito';
      case FormaPagamento.CARTAO_DEBITO:     return 'Cartão de Débito';
      case FormaPagamento.ISENCAO:           return 'Isenção';
    }
  }

  private static readonly FORMAS_CARTAO = [
    FormaPagamento.CARTAO_CREDITO,
    FormaPagamento.CARTAO_DEBITO,
  ];

  /** Igual a `getDescription`, mas acrescenta "(Nx)" para cartão de crédito
   * ou débito parcelado em mais de 1x (1x -- ou débito, que normalmente é
   * sempre à vista -- não mostra nada). */
  static getDescriptionComParcelas(forma: string, parcelas: number | null | undefined): string {
    const descricao = FormaPagamento.getDescription(forma);
    if (FormaPagamento.FORMAS_CARTAO.includes(forma) && parcelas && parcelas > 1) {
      return `${descricao}(${parcelas}x)`;
    }
    return descricao;
  }
}
