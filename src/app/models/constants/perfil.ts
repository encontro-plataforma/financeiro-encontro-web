export class PerfilUsuario {
  static ADMINISTRADOR = 'ADMINISTRADOR';
  static CONCILIADOR   = 'CONCILIADOR';
  static REPORTER      = 'REPORTER';
  static TODOS         = '';

  static get optionsAll() {
    return [
      { name: 'Todos',         value: PerfilUsuario.TODOS          },
      { name: 'Administrador', value: PerfilUsuario.ADMINISTRADOR  },
      { name: 'Conciliador',   value: PerfilUsuario.CONCILIADOR    },
      { name: 'Reporter',      value: PerfilUsuario.REPORTER       },
    ];
  }

  static get options() {
    return [
      { name: 'Administrador', value: PerfilUsuario.ADMINISTRADOR  },
      { name: 'Conciliador',   value: PerfilUsuario.CONCILIADOR    },
      { name: 'Reporter',      value: PerfilUsuario.REPORTER       },
    ];
  }

  static getDescription(perfilUsuario: string): string {
    switch (perfilUsuario) {
      default:                          return 'Desconhecido';
      case PerfilUsuario.ADMINISTRADOR: return 'Administrador';
      case PerfilUsuario.CONCILIADOR:   return 'Conciliador';
      case PerfilUsuario.REPORTER:      return 'Reporter';
    }
  }
}
