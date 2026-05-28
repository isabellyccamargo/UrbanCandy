// Recebe todos os erros que podem acontecer na API, e a partir do código do erro, ele busca a mensagem correspondente e a formata com os parâmetros fornecidos.

import { getErrorMessage } from '../utils/ErrorMessages.js';

type ErrorParam = string | number;

export class ApiException extends Error {
  public readonly code: string;
  public readonly status: number;

  constructor(code: string, status: number, ...params: ErrorParam[]) {
    const template: string = getErrorMessage(code);

    const message: string = formatMessage(template, params);

    super(message);

    this.code = code;
    this.status = status;
  }
}

function formatMessage(message: string, params: ErrorParam[]): string {
  let formatted: string = message;

  params.forEach((param: ErrorParam) => {
    formatted = formatted.replace('{}', String(param));
  });

  return formatted;
}
