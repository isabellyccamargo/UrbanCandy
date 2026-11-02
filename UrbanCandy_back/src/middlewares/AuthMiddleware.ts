import { type NextFunction, type Request } from 'express';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/UserRepository.js';
import { ApiException } from '../exception/ApiException.js';

type TokenPayload = {
  id: number;
  email: string;
};

// eslint-disable @typescript-eslint/no-namespace
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}
// eslint-enable @typescript-eslint/no-namespace

async function authMiddleware(req: Request, _res: unknown, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new ApiException('AUTH_REQUIRED', 403));
  }

  //Quebra o bearer e pega só o token
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return next(new Error('JWT_SECRET não configurado no ambiente.'));
  }

  if (!token) {
    return next(new ApiException('INVALID_TOKEN', 401));
  }

  let decoded: TokenPayload;
  try {
    //Verifica se o token nao foi modificado ou expirado
    decoded = jwt.verify(token, secret) as unknown as TokenPayload;
  } catch {
    return next(new ApiException('INVALID_TOKEN', 401));
  }

  try {
    const user = await UserRepository.findByIdUser(decoded.id);

    if (user) {
      req.userId = decoded.id;
      return next();
    }

    return next(new ApiException('USER_NOT_FOUND', 404));
  } catch (error) {
    return next(error);
  }
}
export default authMiddleware;
