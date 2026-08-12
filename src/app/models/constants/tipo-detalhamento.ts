export class TipoDetalhamento {
  static INSCRICAO_ENCONTREIRO = 'INSCRICAO_ENCONTREIRO';
  static INSCRICAO_ENCONTRISTA = 'INSCRICAO_ENCONTRISTA';
  static OFERTA                = 'OFERTA';
  static OUTRO                 = 'OUTRO';

  static get options() {
    return [
      { name: 'Inscrição de Encontreiro', value: TipoDetalhamento.INSCRICAO_ENCONTREIRO },
      { name: 'Inscrição de Encontrista', value: TipoDetalhamento.INSCRICAO_ENCONTRISTA },
      { name: 'Oferta',                   value: TipoDetalhamento.OFERTA },
      { name: 'Outro',                    value: TipoDetalhamento.OUTRO },
    ];
  }

  static getDescription(tipo: string): string {
    switch (tipo) {
      default:                                          return 'Desconhecido';
      case TipoDetalhamento.INSCRICAO_ENCONTREIRO:      return 'Inscrição de Encontreiro';
      case TipoDetalhamento.INSCRICAO_ENCONTRISTA:      return 'Inscrição de Encontrista';
      case TipoDetalhamento.OFERTA:                      return 'Oferta';
      case TipoDetalhamento.OUTRO:                       return 'Outro';
    }
  }
}
