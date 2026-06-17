// ─── scripts/sync-brain-to-akashico.ts ────────────────────────
// Sincroniza specs e guias do ZEHLA para o Campo Akáshico

import fs from 'fs';
import path from 'path';
import { akashicBridge } from '../src/lib/akashico/AkashicBridge';

// Documentos a indexar no Campo Akáshico (buscados na raiz do projeto)
const KNOWLEDGE_FILES = [
  { file: 'SPEC.md', category: 'arquitetura' },
  { file: 'SPEC_COMERCIAL.md', category: 'comercial' },
  { file: 'SPEC_OPERACIONAL.md', category: 'operacional' },
  { file: 'SPEC_MARKETING.md', category: 'marketing' },
  { file: 'SPEC_REVENUE.md', category: 'revenue' },
  { file: 'SPEC_FRONTEND.md', category: 'frontend' },
  { file: 'AGENTS.md', category: 'agentes' },
  { file: 'SKILL.md', category: 'skills' },
];

async function syncBrainToAkashico(): Promise<void> {
  console.log('🔄 Iniciando sincronização Cérebro ZEHLA → Campo Akáshico...');

  // Verificar se o microsserviço Akáshico está de pé
  const isHealthy = await akashicBridge.health();
  console.log(`📡 Status de conexão com o Campo Akáshico: ${isHealthy ? 'ONLINE' : 'OFFLINE (simulando localmente)'}`);

  let totalSections = 0;
  let totalIngested = 0;

  for (const { file, category } of KNOWLEDGE_FILES) {
    const filePath = path.resolve('./', file);
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  Arquivo não encontrado na raiz: ${file}`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const sections = splitIntoSections(content); // Segmenta por ## headers

    console.log(`📄 Lendo ${file}: ${sections.length} seções identificadas...`);

    for (const section of sections) {
      totalSections++;
      try {
        const textToIngest = `Documento: ${file}\nSeção: ${section.title}\n\n${section.body}`;
        
        await akashicBridge.ingestEvent({
          pousada_id: 'ZEHLA_SYSTEM',
          source_channel: 'brain_sync',
          intent_classified: category,
          input_text: textToIngest,
          guest_profile: file, // Referencia o arquivo original nos metadados
        });
        totalIngested++;
      } catch (error) {
        console.error(`❌ Erro ao ingerir seção "${section.title}" do arquivo ${file}:`, error);
      }
    }
  }

  console.log(`\n✅ Sincronização concluída:`);
  console.log(`   Seções processadas: ${totalSections}`);
  console.log(`   Seções ingeridas:   ${totalIngested}`);
  console.log(`   Seções com erro:    ${totalSections - totalIngested}`);
}

/**
 * Segmenta conteúdo markdown por seções (headers ##)
 */
function splitIntoSections(content: string): Array<{
  index: number;
  title: string;
  body: string;
}> {
  const sections: Array<{ index: number; title: string; body: string }> = [];
  const lines = content.split('\n');
  let currentTitle = 'Introdução';
  let currentBody: string[] = [];
  let sectionIndex = 0;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      // Salva seção anterior
      if (currentBody.length > 0) {
        sections.push({
          index: sectionIndex++,
          title: currentTitle,
          body: currentBody.join('\n').trim(),
        });
      }
      currentTitle = line.replace(/^##\s+/, '');
      currentBody = [];
    } else {
      currentBody.push(line);
    }
  }

  // Salva última seção
  if (currentBody.length > 0) {
    sections.push({
      index: sectionIndex,
      title: currentTitle,
      body: currentBody.join('\n').trim(),
    });
  }

  return sections;
}

// Execução
syncBrainToAkashico()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Falha catastrófica na sincronização:', error);
    process.exit(1);
  });
