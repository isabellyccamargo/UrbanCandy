import express, { type Application } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import publico from './src/routes/Public.js';
import { dataBaseConectionn } from './src/config/Config.js';
import { setupAssociations } from './src/models/Associations.js';
import { errorHandler } from './src/middlewares/ErrorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server: Application = express();
const PORT = process.env.PORT || 3000;

// 2. Configure o CORS ANTES das rotas e do express.json
server.use(
  cors({
    origin: '*', // Em desenvolvimento, o '*' libera para qualquer origem (Vite, Thunder Client, etc.)
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })
);

dataBaseConectionn();
setupAssociations();

// 3. O express.json deve vir logo após o CORS
server.use(express.json());

// Health check endpoint
server.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Altere para usar process.cwd() para apontar para a raiz (/app)
server.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
server.use('/api', publico);

// Middleware de tratamento de erros - DEVE ser o último middleware
server.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Servidor TypeScript rodando na porta ${PORT}`);
});

export default server;
