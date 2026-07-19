export class StatusProcessamento {
  static PROCESSANDO = 'PROCESSANDO';
  static PROCESSADO  = 'PROCESSADO';
  static ERRO        = 'ERRO';
  static TODOS       = '';

  static get optionsAll() {
    return [
      { name: 'Todos',       value: StatusProcessamento.TODOS       },
      { name: 'Processando', value: StatusProcessamento.PROCESSANDO },
      { name: 'Processado',  value: StatusProcessamento.PROCESSADO  },
      { name: 'Erro',        value: StatusProcessamento.ERRO        },
    ];
  }

  static get options() {
    return [
      { name: 'Processando', value: StatusProcessamento.PROCESSANDO },
      { name: 'Processado',  value: StatusProcessamento.PROCESSADO  },
      { name: 'Erro',        value: StatusProcessamento.ERRO        },
    ];
  }

  static getDescription(status: string): string {
    switch (status) {
      default:                                   return 'Desconhecido';
      case StatusProcessamento.PROCESSANDO:      return 'Processando';
      case StatusProcessamento.PROCESSADO:       return 'Processado';
      case StatusProcessamento.ERRO:             return 'Erro';
    }
  }
}
