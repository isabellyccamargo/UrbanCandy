// Esse arquivo lê o arquivo .properties e guarda as mensagens em memória.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath: string = path.join(__dirname, '..', 'config', 'errors_messages.properties');

const messages: Record<string, string> = {};

try {
  if (fs.existsSync(filePath)) {
    const fileContent: string = fs.readFileSync(filePath, 'utf-8');

    fileContent.split(/\r?\n/).forEach((line: string) => {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith('#')) return;

      const [key, ...valueParts] = trimmedLine.split('=');

      if (key && valueParts.length > 0) {
        messages[key.trim()] = valueParts.join('=').trim();
      }
    });
  } else {
    console.warn(`⚠️ Aviso: Arquivo de mensagens não encontrado em ${filePath}`);
  }
} catch (error) {
  console.error(`🚨 Erro crítico ao processar o arquivo de mensagens: ${error}`);
}

// Essa função consulta o objeto 'messages' que foi preenchido de forma segura
export function getErrorMessage(code: string): string {
  return messages[code] ?? `[${code}] (Mensagem não definida)`;
}
