import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse }  from '@angular/common/http';

import { ToastService } from '../components/toast/toast.service';

@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  private toast = inject(ToastService);

  handler(err: unknown): void {
    this.toast.error({ message: this.resolve(err) });
  }

  private resolve(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      return this.resolveHttp(err);
    }
    if (err instanceof Error) {
      return err.message || 'Ocorreu um erro inesperado.';
    }
    return 'Ocorreu um erro inesperado.';
  }

  private resolveHttp(err: HttpErrorResponse): string {
    // Sem conexão / timeout
    if (err.status === 0) {
      return 'Sem conexão com o servidor. Verifique sua internet ou tente novamente.';
    }

    // Fallbacks por status HTTP
    switch (err.status) {
      case 400: return 'Requisição inválida.';
      case 401: return 'Não autorizado. Faça login novamente.';
      case 403: return 'Acesso negado.';
      case 404: return 'Recurso não encontrado.';
      case 409: return 'Conflito: o recurso já existe.';
      case 422: return 'Dados inválidos na requisição.';
      case 500: return 'Erro interno do servidor. Tente novamente mais tarde.';
    }

    // Tenta usar o campo "detail" retornado pelo FastAPI
    const detail = err.error?.detail;

    if (detail) {
      // Erros de validação do Pydantic (422): detail é um array de objetos
      if (Array.isArray(detail)) {
        const msgs = detail
          .map((d: { msg?: string }) => d.msg)
          .filter(Boolean)
          .join('; ');
        return msgs || 'Dados inválidos na requisição.';
      }
      // Detalhe como string simples (400, 404, etc.)
      if (typeof detail === 'string') {
        return detail;
      }
    }

    // Fallbacks por status HTTP
    return `Erro ${err.status}: ${err.statusText || 'desconhecido'}.`;
  }
}
