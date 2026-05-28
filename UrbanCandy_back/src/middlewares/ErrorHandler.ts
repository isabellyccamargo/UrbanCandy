// Aqui ele vai capturar qualquer erro de API e retornar uma resposta padronizada para o cliente.

import { type Request, type Response, type NextFunction } from 'express';
import { ApiException } from '../exception/ApiException.js';
import type { ErrorResponse } from '../dto/ErrorResponse.js';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
): Response<ErrorResponse> {
  if (error instanceof ApiException) {
    const response: ErrorResponse = {
      code: error.code,
      message: error.message,
    };

    return res.status(error.status).json(response);
  }

  const response: ErrorResponse = {
    code: 'INTERNAL_ERROR',
    message: 'Erro interno no servidor',
  };

  return res.status(500).json(response);
}
