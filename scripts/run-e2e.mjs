import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const backendDirectory = path.join(repositoryRoot, "UrbanCandy_back");
const frontendDirectory = path.join(repositoryRoot, "UrbanCandy_front");
const tsxCli = path.join(
  backendDirectory,
  "node_modules",
  "tsx",
  "dist",
  "cli.mjs",
);
const apiUrl = "http://127.0.0.1:3000/api";
let backend;

function run(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", ...options });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} exited with ${code ?? signal}`));
    });
  });
}

async function runTestDatabaseScript(script) {
  await run(process.execPath, [tsxCli, script], {
    cwd: backendDirectory,
    env: { ...process.env, NODE_ENV: "test" },
  });
}

async function waitForBackend() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (backend.exitCode !== null) {
      throw new Error(
        `Backend encerrou antes de ficar pronto (código ${backend.exitCode}).`,
      );
    }

    try {
      const response = await fetch(`${apiUrl}/health`, {
        signal: AbortSignal.timeout(1_000),
      });
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1_000));
    }
  }

  throw new Error("Backend de teste não respondeu em até 60 segundos.");
}

async function main() {
  if (!existsSync(tsxCli)) {
    throw new Error(
      "tsx não instalado no backend. Execute npm ci na raiz do projeto.",
    );
  }

  await runTestDatabaseScript("scripts/resetTestDatabase.ts");
  await runTestDatabaseScript("scripts/seedTestDatabase.ts");

  backend = spawn(process.execPath, [tsxCli, "Server.ts"], {
    cwd: backendDirectory,
    env: { ...process.env, NODE_ENV: "test", PORT: "3000" },
    stdio: "inherit",
  });

  await waitForBackend();

  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
  await run(npmCommand, ["run", "test:e2e"], {
    cwd: frontendDirectory,
    env: {
      ...process.env,
      CI: "true",
      VITE_API_URL: apiUrl,
    },
    shell: process.platform === "win32",
  });
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (backend && backend.exitCode === null) {
    backend.kill("SIGTERM");
  }
}
