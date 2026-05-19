// scratch/test-pipeline.ts — Teste de Stress do ZEHLA Brain v4
import { captureQueue, CLUSTER_THRESHOLDS } from '../src/lib/queues';
import { prisma } from '../src/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

async function testPipeline() {
  const testEmail = `test_lead_${Date.now()}@example.com`;
  console.log(`\n🚀 Iniciando Teste de Pipeline para: ${testEmail}\n`);

  // 1. Simular Evento AWARE (+5 pts)
  console.log('📡 [Step 1] Enviando EMAIL_OPEN...');
  await captureQueue.add('capture-event', {
    trackingId: uuidv4(),
    email: testEmail,
    eventType: 'EMAIL_OPEN',
    eventSource: 'test_suite',
    metadata: { campaign: 'welcome_series' }
  });

  // 2. Simular Evento INTERESTED (+15 pts)
  console.log('📡 [Step 2] Enviando LINK_CLICK...');
  await captureQueue.add('capture-event', {
    trackingId: uuidv4(),
    email: testEmail,
    eventType: 'LINK_CLICK',
    eventSource: 'test_suite',
    metadata: { url: 'https://zehla.com/pricing' }
  });

  // 3. Simular Evento ENGAGED (+30 pts)
  console.log('📡 [Step 3] Enviando WHATSAPP_REPLY...');
  await captureQueue.add('capture-event', {
    trackingId: uuidv4(),
    email: testEmail,
    eventType: 'WHATSAPP_REPLY',
    eventSource: 'test_suite',
    metadata: { message: 'Quero saber mais sobre o plano PRO' }
  });

  // 4. Simular Evento HOT (+50 pts) -> Total deve passar de 60
  console.log('📡 [Step 4] Enviando TRIAL_STARTED...');
  await captureQueue.add('capture-event', {
    trackingId: uuidv4(),
    email: testEmail,
    eventType: 'TRIAL_STARTED',
    eventSource: 'test_suite',
    metadata: { plan: 'PRO' }
  });

  console.log('\n⏳ Aguardando 10 segundos para processamento dos workers...\n');
  await new Promise(r => setTimeout(r, 10000));

  // 5. Verificar Resultado no Banco
  const lead = await prisma.lead.findFirst({
    where: { email: testEmail },
    include: { events: true, actionLogs: true }
  }) as any;

  if (!lead) {
    console.error('❌ Lead não encontrado no banco após processamento!');
    return;
  }

  console.log('📊 RESULTADOS DO TESTE:');
  console.log(`- Lead: ${lead.name} (${lead.email})`);
  console.log(`- Score Final: ${lead.conversionScore}`);
  console.log(`- Cluster Atual: ${lead.cluster}`);
  console.log(`- Eventos Processados: ${lead.events.length}`);
  console.log(`- Ações Disparadas: ${lead.actionLogs.length}`);

  lead.actionLogs.forEach(log => {
    console.log(`  [Action] ${log.actionType} -> ${log.status} (${log.cluster})`);
  });

  if (lead.cluster === 'HOT' && lead.conversionScore >= CLUSTER_THRESHOLDS.HOT) {
    console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO: O lead atingiu o cluster HOT e disparou ações.');
  } else {
    console.log('\n⚠️ TESTE INCOMPLETO: O lead não atingiu o estado esperado. Verifique os workers.');
  }
}

testPipeline()
  .catch(console.error)
  .finally(() => process.exit(0));
