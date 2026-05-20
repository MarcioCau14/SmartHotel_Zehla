import * as dotenv from 'dotenv';
import axios from 'axios';
import path from 'path';


// Carrega variáveis de ambiente do .env na raiz
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const OPERATIONAL_KEY = process.env.OPERATIONAL_API_KEY || 'zehla_swarm_secret';

/**
 * ZEHLA OPERATIONAL WARMUP
 * Script para "abrir" o sistema via HTTP (Pulse Check) e processar leads.
 */
async function runWarmup() {

  const targets = [
    { name: 'ZCC (Central)', path: '/zcc' },
    { name: 'DASHBOARD (Cliente)', path: '/dashboard' },
    { name: 'VENDAS (Landing)', path: '/vendas/pro' },
    { name: 'HEALTH API', path: '/api/health' }
  ];

  // 1. SYSTEM PULSE (Zero Browser "Opening")
  for (const target of targets) {
    try {
      const start = Date.now();
      const res = await axios.get(`${BASE_URL}${target.path}`, { timeout: 10000 });
      const duration = Date.now() - start;
    } catch (error: unknown) {
      console.error(`❌ ${target.name}: FALHA (${error.message})`);
    }
  }

  // 2. LEAD INGESTION (Se houver lote pendente)
  // Nota: Em GHA, este script pode ser estendido para ler um JSON de arquivo.
}

runWarmup().catch(err => {
  console.error('💥 Erro crítico no warmup:', err);
  process.exit(1);
});
