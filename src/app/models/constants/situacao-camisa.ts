export class SituacaoCamisa {
  static PENDENTE   = 'PENDENTE';
  static SOLICITADA = 'SOLICITADA';
  static RECEBIDA   = 'RECEBIDA';
  static ENTREGUE   = 'ENTREGUE';
  static SEM_BLUSA  = 'SEM_BLUSA';

  static get options() {
    return [
      { name: 'Pendente',   value: SituacaoCamisa.PENDENTE   },
      { name: 'Solicitada', value: SituacaoCamisa.SOLICITADA },
      { name: 'Recebida',   value: SituacaoCamisa.RECEBIDA   },
      { name: 'Entregue',   value: SituacaoCamisa.ENTREGUE   },
      { name: 'Sem blusa',  value: SituacaoCamisa.SEM_BLUSA  },
    ];
  }

  static getDescription(situacao: string): string {
    switch (situacao) {
      default:                          return 'Desconhecido';
      case SituacaoCamisa.PENDENTE:     return 'Pendente';
      case SituacaoCamisa.SOLICITADA:   return 'Solicitada';
      case SituacaoCamisa.RECEBIDA:     return 'Recebida';
      case SituacaoCamisa.ENTREGUE:     return 'Entregue';
      case SituacaoCamisa.SEM_BLUSA:    return 'Sem blusa';
    }
  }
}
