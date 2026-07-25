export class AcessoEquipe {
  static EDG      = 'EDG';
  static VERMELHO = 'VERMELHO';
  static AMARELO  = 'AMARELO';
  static VERDE    = 'VERDE';

  static get options() {
    return [
      { name: 'EDG',      value: AcessoEquipe.EDG      },
      { name: 'Vermelho', value: AcessoEquipe.VERMELHO },
      { name: 'Amarelo',  value: AcessoEquipe.AMARELO  },
      { name: 'Verde',    value: AcessoEquipe.VERDE    },
    ];
  }

  static getDescription(acesso: string): string {
    switch (acesso) {
      default:                     return 'Desconhecido';
      case AcessoEquipe.EDG:       return 'EDG';
      case AcessoEquipe.VERMELHO:  return 'Vermelho';
      case AcessoEquipe.AMARELO:   return 'Amarelo';
      case AcessoEquipe.VERDE:     return 'Verde';
    }
  }
}
