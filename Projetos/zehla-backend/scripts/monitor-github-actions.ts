import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const REPO = 'MarcioCau14/SmartHotel_Zehla';
const OUTPUT_DIR = path.join(__dirname, '../zehla_data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'github-actions.json');

interface ActionRun {
  id: number;
  name: string;
  head_branch: string;
  head_sha: string;
  event: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  actor: {
    login: string;
  };
}

async function main() {
  console.log(`🔍 [ZEHLA GUARDIAN] Iniciando monitoramento seguro do GitHub Actions para ${REPO}...`);

  try {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    let rawData = '';
    let ghPath = 'gh';

    // Resolver caminho do gh de forma robusta
    try {
      ghPath = execSync('which gh', { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
      const commonPaths = [
        '/Users/marciocau/.local/bin/gh',
        '/usr/local/bin/gh',
        '/opt/homebrew/bin/gh'
      ];
      for (const p of commonPaths) {
        if (fs.existsSync(p)) {
          ghPath = p;
          break;
        }
      }
    }

    // Método 1: Tenta usar o GitHub CLI local (gh) que já resolve credenciais do chaveiro do sistema com segurança
    try {
      console.log(`🗝️ Usando GitHub CLI (${ghPath}) para obter status...`);
      rawData = execSync(`"${ghPath}" api "repos/${REPO}/actions/runs?per_page=5"`, { encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (cliError: any) {
      const errorDetail = cliError.stderr?.toString().trim() || cliError.message;
      console.log(`⚠️ Erro ao executar GitHub CLI: ${errorDetail}`);
      console.log('Tentando via fetch com token do ambiente...');
      
      // Método 2: Fallback para HTTPS Fetch usando tokens de ambiente
      const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
      if (!token) {
        throw new Error(
          'Nenhuma credencial segura encontrada.\n' +
          '👉 Se você usa o GitHub CLI, faça login no seu terminal rodando: gh auth login\n' +
          '👉 Ou defina a variável de ambiente GH_TOKEN ou GITHUB_TOKEN no seu terminal.'
        );
      }

      const response = await fetch(`https://api.github.com/repos/${REPO}/actions/runs?per_page=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'Zehla-Agent-Monitor'
        }
      });

      if (!response.ok) {
        throw new Error(`Erro na API do GitHub: ${response.statusText} (${response.status})`);
      }

      rawData = await response.text();
    }

    const data = JSON.parse(rawData);
    const runs: ActionRun[] = data.workflow_runs || [];

    const summary = {
      updatedAt: new Date().toISOString(),
      repository: REPO,
      latestRuns: runs.map(run => ({
        id: run.id,
        name: run.name,
        branch: run.head_branch,
        commit: run.head_sha.slice(0, 7),
        event: run.event,
        status: run.status,
        conclusion: run.conclusion,
        url: run.html_url,
        createdAt: run.created_at,
        author: run.actor?.login
      })),
      hasFailures: runs.some(run => run.conclusion === 'failure')
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(summary, null, 2), 'utf-8');
    console.log(`✅ Telemetria de Actions salva com sucesso em: ${OUTPUT_FILE}`);
    
    if (summary.hasFailures) {
      console.warn('🚨 [ALERT] Detectada falha em uma ou mais compilações/testes do GitHub Actions!');
    }
  } catch (error: any) {
    console.error('❌ Erro no monitoramento do GitHub Actions:', error.message);
    
    // Escreve o estado de erro para telemetria local
    const errorState = {
      updatedAt: new Date().toISOString(),
      repository: REPO,
      error: error.message,
      hasFailures: false
    };
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(errorState, null, 2), 'utf-8');
    process.exit(1);
  }
}

main();
