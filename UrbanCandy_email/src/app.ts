import express, { type NextFunction, type Request, type Response } from 'express';
import { config } from './config.js';
import {
  confirmEmailVerification,
  EmailServiceError,
  isEmailVerified,
  requestEmailVerification,
} from './verificationService.js';

export function createApp() {
  const app = express();
  app.use(express.json());
  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  app.post(
    '/internal/verifications',
    requireServiceKey,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email, userId } = req.body as { email?: unknown; userId?: unknown };
        if (typeof email !== 'string' || !Number.isInteger(userId)) {
          return res.status(400).json({ message: 'email and integer userId are required.' });
        }
        const result = await requestEmailVerification(email, Number(userId));
        return res.status(202).json(result);
      } catch (error) {
        next(error);
      }
    }
  );

  app.post(
    '/internal/verifications/confirm',
    requireServiceKey,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email, code } = req.body as { email?: unknown; code?: unknown };
        if (typeof email !== 'string' || typeof code !== 'string') {
          return res.status(400).json({ message: 'email and code are required.' });
        }
        const result = await confirmEmailVerification(email, code);
        return res.status(200).json(result);
      } catch (error) {
        next(error);
      }
    }
  );

  app.post(
    '/internal/verifications/status',
    requireServiceKey,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { email } = req.body as { email?: unknown };
        if (typeof email !== 'string') {
          return res.status(400).json({ message: 'email is required.' });
        }
        return res.status(200).json({ verified: await isEmailVerified(email) });
      } catch (error) {
        next(error);
      }
    }
  );

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const knownError = error instanceof EmailServiceError;
    const message = knownError ? error.message : 'Internal email service error.';
    const status = knownError ? error.status : 500;
    res.status(status).json({ message });
  });
  return app;
}

function requireServiceKey(req: Request, res: Response, next: NextFunction): void {
  if (!config.apiKey || req.header('x-service-key') !== config.apiKey) {
    res.status(401).json({ message: 'Unauthorized service request.' });
    return;
  }
  next();
}
