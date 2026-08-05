export class EscopoRegraGrupo {
  static EXTRACAO_ENCONTREIRO = 'EXTRACAO_ENCONTREIRO';
  static EXTRACAO_ENCONTRISTA = 'EXTRACAO_ENCONTRISTA';
  static OFERTAS              = 'OFERTAS';

  static getDescription(escopo: string): string {
    switch (escopo) {
      default:                                        return escopo;
      case EscopoRegraGrupo.EXTRACAO_ENCONTREIRO:      return 'Inscrição de Encontreiro';
      case EscopoRegraGrupo.EXTRACAO_ENCONTRISTA:      return 'Inscrição de Encontrista';
      case EscopoRegraGrupo.OFERTAS:                    return 'Ofertas';
    }
  }
}
