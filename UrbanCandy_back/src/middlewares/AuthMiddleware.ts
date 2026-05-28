import { type NextFunction, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/UserRepository.js';
import 'dotenv/config';

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

async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({ message: 'Acesso não permitido' });
  }

  //Quebra o bearer e pega só o token
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não configurado no ambiente.');
  }

  if (!token) {
    return res.status(401).json({ message: 'Token malformatado ou ausente' });
  }

  try {
    //Verifica se o token nao foi modificado ou expirado
    const decoded = jwt.verify(token, secret) as unknown as TokenPayload;

    const user = await UserRepository.findByIdUser(decoded.id);

    if (user) {
      req.userId = decoded.id;
      return next();
    }

    return res.status(404).json({ message: 'Usuário não encontrado!' });
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}
export default authMiddleware;
