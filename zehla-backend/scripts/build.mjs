import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";

// Workaround: Next.js 16.x + output:standalone + Edge middleware nao gera
// middleware.js nem middleware.js.nft.json, causando ENOENT na finalizacao.
// Mantemos ambos atualizados por polling durante o build.
const cwd = process.cwd();
const outDir = join(cwd, ".next", "server");
const nft = join(outDir, "middleware.js.nft.json");
const middleJs = join(outDir, "middleware.js");

function ensureFiles() {
  mkdirSync(outDir, { recursive: true });
  if (!existsSync(nft)) {
    writeFileSync(nft, JSON.stringify({ version: 1, files: [] }), "utf-8");
  }
  if (!existsSync(middleJs)) {
    writeFileSync(middleJs, "// stub - edge middleware compilado em chunks\n", "utf-8");
  }
}

const interval = setInterval(ensureFiles, 500);

const child = spawn("npx", ["next", "build"], {
  stdio: "inherit",
  cwd,
  env: { ...process.env },
  shell: true,
});

child.on("close", (code) => {
  clearInterval(interval);
  ensureFiles();
  process.exit(code);
});
