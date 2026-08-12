ListFilterBase & FilterStateService
===================================

Resumo
-----
Esta pasta contém a `ListFilterBase` (classe abstrata) e o `FilterStateService` — utilitários para
persistir e restaurar o último filtro e paginação usados em telas de listagem.

Objetivo
--------
- Centralizar comportamento de salvar/recuperar filtros em `localStorage`.
- Evitar repetição de código nas várias listagens do app.

Como usar
---------

1. Extenda `ListFilterBase` na sua componente de listagem:

```ts
export class MinhaListaComponent extends ListFilterBase implements OnInit {
  // ... injete services normalmente

  ngOnInit(): void {
    // restaura estado salvo (se houver) e permite ajustar campos carregados
    this.initFilter('minha-chave', (saved) => {
      this.search = saved.search ?? this.search;
      this.outroFiltro = saved.outroFiltro ?? this.outroFiltro;
    });

    // salve estado quando filtros mudarem
    // por exemplo em valueChanges ou handlers de UI:
    this.saveState({ search: this.search, outroFiltro: this.outroFiltro });
  }

  onPage(event: PageEvent) {
    // atualiza paginação e salva estado com handlePage
    this.handlePage(event, () => ({ search: this.search, outroFiltro: this.outroFiltro }), () => this.load());
  }
}
```

2. Chaves de armazenamento
- O `FilterStateService` prefixa todas as chaves com `app.filters.`. Use chaves legíveis,
  por exemplo `lancamentos`, `encontreiros` ou `lancamento-detalhamentos.{id}` para estados por item.

3. API principal
- `initFilter(key: string, restoreFn?: (saved:any) => void)`: restaura estado salvo e executa `restoreFn` para aplicar valores.
- `saveState(state: any)`: salva o objeto de estado atual (paginação é mesclada automaticamente).
- `handlePage(event: PageEvent, stateProvider?: ()=>any, after?: ()=>void)`: atualiza `pageIndex`/`pageSize`, salva estado via `stateProvider` e executa `after`.

Notas
-----
- Erros de `localStorage` são silenciados para não quebrar a UI.
- Para limpar um estado manualmente use `FilterStateService.clear(key)`.

Exemplos no projeto
-------------------
- `src/app/components/financeiro/lancamentos/lancamentos.component.ts` — exemplo completo de filtros com `FormGroup`.
- `src/app/components/secretaria/encontreiros/encontreiros.component.ts` e `encontristas.component.ts` — exemplos de filtros baseados em campos simples.
