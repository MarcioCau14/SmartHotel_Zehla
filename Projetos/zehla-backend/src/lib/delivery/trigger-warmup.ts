import { LISBatchValidator } from '../intelligence/lis-validator';
import { ZMGDispatcher } from './zmg-dispatcher';
import * as fs from 'fs';
import path from 'path';

/**
 * Script de Gatilho da Esteira de Warmup ZEHLA
 * Uso: npx ts-node src/lib/delivery/trigger-warmup.ts <caminho_do_json>
 */
async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("❌ Erro: Forneça o caminho para o arquivo JSON de leads.");
    process.exit(1);
  }

  const absolutePath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`❌ Erro: Arquivo não encontrado em ${absolutePath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(absolutePath, 'utf-8');
  const rawLeads = JSON.parse(rawData);

  console.log(`🚀 [ZEHLA] Iniciando Esteira para ${rawLeads.length} leads brutos.`);

  // 1. Validação e Enriquecimento (LIS)
  const validator = new LISBatchValidator();
  const topLeads = await validator.processBatch(rawLeads);

  console.log(`✅ [LIS] Validação concluída. ${topLeads.length} leads qualificados para a fila.`);

  // 2. Enfileiramento e Disparo (ZMG)
  const dispatcher = new ZMGDispatcher();
  await dispatcher.enqueueLeads(topLeads);

  console.log(`🏁 [ZEHLA] Todos os leads foram enfileirados. O Worker processará a 10 msgs/min.`);
}

main().catch(err => {
  console.error("💥 Erro crítico na esteira:", err);
  process.exit(1);
});
