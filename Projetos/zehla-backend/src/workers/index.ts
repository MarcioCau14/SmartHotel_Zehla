import { actWorker } from './actWorker';
import { captureWorker } from './captureWorker';
import { classifyWorker } from './classifyWorker';
import { enrichWorker } from './enrichWorker';
import { subconsciousWorker } from '../lib/ml/subconscious-worker';
import { validateWorker } from './validateWorker';


// src/workers/index.ts — ZEHLA Brain v4: Worker Orchestrator
// Inicializa todos os 5 workers + Graceful Shutdown

const workers = [
  { name: 'Capture', worker: captureWorker },
  { name: 'Validate', worker: validateWorker },
  { name: 'Enrich', worker: enrichWorker },
  { name: 'Classify', worker: classifyWorker },
  { name: 'Act', worker: actWorker },
  { name: 'Subconscious', worker: subconsciousWorker },
];

async function startAllWorkers() {

  
  
  

  for (const { name, worker } of workers) {
    worker.on('ready', () => {
      
    });

    worker.on('error', (err) => {
      console.error(`  ❌ [${name}] Erro:`, err.message);
    });
  }

  
  
}

// Graceful Shutdown
async function shutdown(signal: string) {
  

  const closePromises = workers.map(async ({ name, worker }) => {
    try {
      await worker.close();
      console.log(`  ✅ [${name}] encerrado com sucesso`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ [${name}] Erro ao encerrar:`, msg);
    }
  });

  await Promise.all(closePromises);
  
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
