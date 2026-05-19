import { subconsciousWorker } from './src/lib/ml/subconscious-worker';
import { CognitiveTerminal } from './src/lib/observability/cognitive-terminal';

console.log('🚀 [ZEHLA-BRAIN] Iniciando Worker Subconsciente...');

subconsciousWorker.on('ready', () => {
  console.log('✅ Worker pronto para processar a Árvore de Memória.');
});

// Mantém o processo vivo
process.on('SIGINT', async () => {
  await subconsciousWorker.close();
  process.exit(0);
});
