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

server.use(express.json());

// 3. O express.json deve vir logo após o CORS
server.use(express.json());

server.use('/uploads', express.static(path.join(__dirname, 'uploads')));
server.use(publico);

// Middleware de tratamento de erros - DEVE ser o último middleware
server.use(errorHandler);

server.listen(3030, () => {
  console.log('Servidor TypeScript rodando na porta 3030');
});

export default server;
