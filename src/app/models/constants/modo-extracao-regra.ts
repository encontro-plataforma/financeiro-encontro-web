export class ModoExtracaoRegra {
  static TOKEN_VALOR   = 'TOKEN_VALOR';
  static NOME_NA_LISTA = 'NOME_NA_LISTA';

  static get options() {
    return [
      { name: 'Token + valor (regex)',        value: ModoExtracaoRegra.TOKEN_VALOR },
      { name: 'Nome na lista compartilhada',  value: ModoExtracaoRegra.NOME_NA_LISTA },
    ];
  }

  static getDescription(modo: string): string {
    switch (modo) {
      default:                                    return 'Desconhecido';
      case ModoExtracaoRegra.TOKEN_VALOR:        return 'Token + valor (regex)';
      case ModoExtracaoRegra.NOME_NA_LISTA:      return 'Nome na lista compartilhada';
    }
  }
}
