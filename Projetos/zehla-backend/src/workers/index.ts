// src/workers/index.ts — ZEHLA Brain v4: Worker Orchestrator
// Inicializa todos os 5 workers + Graceful Shutdown
import { captureWorker } from './captureWorker';
import { validateWorker } from './validateWorker';
import { enrichWorker } from './enrichWorker';
import { classifyWorker } from './classifyWorker';
import { actWorker } from './actWorker';
import { subconsciousWorker } from '../lib/ml/subconscious-worker';

const workers = [
  { name: 'Capture', worker: captureWorker },
  { name: 'Validate', worker: validateWorker },
  { name: 'Enrich', worker: enrichWorker },
  { name: 'Classify', worker: classifyWorker },
  { name: 'Act', worker: actWorker },
  { name: 'Subconscious', worker: subconsciousWorker },
];

async function startAllWorkers() {
  console.log('\n🧠 ═══════════════════════════════════════════════');
  console.log('   ZEHLA BRAIN v4.0 — Pipeline Cognitiva');
  console.log('   5 Workers BullMQ Inicializados');
  console.log('═══════════════════════════════════════════════\n');

  for (const { name, worker } of workers) {
    worker.on('ready', () => {
      console.log(`  ✅ [${name}] Worker pronto`);
    });

    worker.on('error', (err) => {
      console.error(`  ❌ [${name}] Erro:`, err.message);
    });
  }

  console.log('📡 Pipeline ativa: Capture → Validate → Enrich → Classify → Act');
  console.log('🛡️ Graceful Shutdown: SIGTERM / SIGINT\n');
}

// Graceful Shutdown
async function shutdown(signal: string) {
  console.log(`\n🛑 [Brain] Recebido ${signal}. Encerrando workers...`);

  const closePromises = workers.map(async ({ name, worker }) => {
    try {
      await worker.close();
      console.log(`  ✅ [${name}] Encerrado`);
    } catch (err: any) {
      console.error(`  ❌ [${name}] Erro ao encerrar:`, err.message);
    }
  });

  await Promise.all(closePromises);
  console.log('🧠 [Brain] Todos os workers encerrados. Até logo.\n');
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Auto-start
startAllWorkers().catch((err) => {
  console.error('💀 [Brain] Falha crítica ao iniciar workers:', err);
  process.exit(1);
});

export { workers };
