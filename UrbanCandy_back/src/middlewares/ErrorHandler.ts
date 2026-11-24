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
  const errorMetadata = error as Error & { code?: string; type?: string };
  const apiException =
    error instanceof ApiException
      ? error
      : errorMetadata.type === 'entity.parse.failed'
        ? new ApiException('INVALID_REQUEST_BODY', 400)
        : error.name === 'MulterError' && errorMetadata.code === 'LIMIT_FILE_SIZE'
          ? new ApiException('FILE_TOO_LARGE', 413)
          : error.name === 'MulterError'
            ? new ApiException('UPLOAD_ERROR', 400)
            : null;
  const isExpectedError = apiException !== null;
  const statusCode = apiException?.status ?? 500;
  const routePath = req.route?.path;
  const route = routePath
    ? `${req.baseUrl}${Array.isArray(routePath) ? routePath[0] : routePath}`
    : 'unmatched';
  const logEntry = {
    event: 'api_error',
    method: req.method,
    route,
    statusCode,
    code: apiException?.code ?? 'INTERNAL_ERROR',
    errorName: apiException ? 'ApiException' : error.name,
    ...(isExpectedError
      ? {}
      : { stackTrace: error.stack?.split('\n').slice(1).join('\n') }),
  };

  if (apiException) {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.error(JSON.stringify(logEntry));
  }

  if (res.headersSent) {
    next(error);
    return res;
  }

  if (apiException) {
    const response: ErrorResponse = {
      code: apiException.code,
      message: apiException.message,
    };

    return res.status(apiException.status).json(response);
  }

  const response: ErrorResponse = {
    code: 'INTERNAL_ERROR',
    message: 'Erro interno no servidor',
  };

  return res.status(500).json(response);
}
