import { CognitiveTerminal } from './src/lib/observability/cognitive-terminal';
import { subconsciousWorker } from './src/lib/ml/subconscious-worker';


subconsciousWorker.on('ready', () => {
  
});

// Mantém o processo vivo
process.on('SIGINT', async () => {
  await subconsciousWorker.close();
  process.exit(0);
});
