import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding ZEHLA SmartHotel database...\n');

  // ===== TARGETS =====
  const targets = [
    { name: 'Rede Costa Atlântica', domain: 'redecostaatlantica.com.br', city: 'Búzios', state: 'RJ', priority: 9 },
    { name: 'Pousadas de Montanha', domain: 'pousadasmontanha.com.br', city: 'Campos do Jordão', state: 'SP', priority: 8 },
    { name: 'Noronha Premium Group', domain: 'noronhapremium.com.br', city: 'Fernando de Noronha', state: 'PE', priority: 10 },
    { name: 'Circuito Histórico', domain: 'circuitohistorico.com.br', city: 'Ouro Preto', state: 'MG', priority: 7 },
    { name: 'Bahia Eco Resorts', domain: 'bahiaecoresorts.com.br', city: 'Porto Seguro', state: 'BA', priority: 5 },
  ];

  for (const t of targets) {
    await db.target.upsert({
      where: { domain: t.domain },
      update: t,
      create: t,
    });
  }
  console.log(`✅ ${targets.length} targets created`);

  // ===== LEADS =====
  const leads = [
    {
      empresa: 'Pousada Sol e Mar', decisor: 'Ana Carolina Mendes', cargo: 'Proprietária',
      email: 'ana@solmar.com.br', whatsapp: '5522999991001', setor: 'hospitalidade',
      porte: 'pequeno', status: 'verified', validationScore: 87,
      socialMedia: '{"instagram":"@pousadasolemar"}',
      metadata: '{"city":"Búzios","state":"RJ","rooms":12,"adr":280}',
    },
    {
      empresa: 'Hotel Fazenda Vila Rica', decisor: 'Roberto Ferreira', cargo: 'Gerente Geral',
      email: 'roberto@vilharica.com.br', whatsapp: '5531999992002', setor: 'hospitalidade',
      porte: 'grande', status: 'verified', validationScore: 92,
      socialMedia: '{"instagram":"@vilafazenda"}',
      metadata: '{"city":"Tiradentes","state":"MG","rooms":35,"adr":450}',
    },
    {
      empresa: 'Casa da Montanha', decisor: 'Juliana Santos', cargo: 'Diretora Comercial',
      email: 'juliana@casamontanha.com.br', whatsapp: '5512999993003', setor: 'hospitalidade',
      porte: 'medio', status: 'verified', validationScore: 78,
      socialMedia: '{"instagram":"@casadamontanha"}',
      metadata: '{"city":"Campos do Jordão","state":"SP","rooms":22,"adr":520}',
    },
    {
      empresa: 'Refúgio da Serra', decisor: 'Marcos Oliveira', cargo: 'Proprietário',
      email: 'marcos@refugioserra.com.br', whatsapp: '5531999994004', setor: 'hospitalidade',
      porte: 'pequeno', status: 'pending', validationScore: 65,
      socialMedia: '{}',
      metadata: '{"city":"Ouro Preto","state":"MG","rooms":8,"adr":180}',
    },
    {
      empresa: 'Pousada Araras', decisor: 'Fernanda Lima', cargo: 'Proprietária',
      email: 'fernanda@araras.com.br', whatsapp: '5562999995005', setor: 'hospitalidade',
      porte: 'pequeno', status: 'verified', validationScore: 83,
      socialMedia: '{"instagram":"@pousadaararas"}',
      metadata: '{"city":"Chapada dos Veadeiros","state":"GO","rooms":10,"adr":220}',
    },
    {
      empresa: 'Solar do Vale', decisor: 'Carlos Eduardo', cargo: 'Gerente',
      email: 'carlos@solarvvale.com.br', whatsapp: '5531999996006', setor: 'hospitalidade',
      porte: 'medio', status: 'contacted', validationScore: 71,
      socialMedia: '{"instagram":"@solarvvale"}',
      metadata: '{"city":"Paraty","state":"RJ","rooms":18,"adr":350}',
    },
    {
      empresa: 'Laguna Beach Lodge', decisor: 'Patricia Almeida', cargo: 'Diretora',
      email: 'patricia@lagunabeach.com.br', whatsapp: '5588999997007', setor: 'hospitalidade',
      porte: 'medio', status: 'verified', validationScore: 89,
      socialMedia: '{"instagram":"@lagunalodge"}',
      metadata: '{"city":"Jericoacoara","state":"CE","rooms":15,"adr":380}',
    },
    {
      empresa: 'Pousada Serenity', decisor: 'Ricardo Mendonça', cargo: 'Proprietário',
      email: 'ricardo@serenity.com.br', whatsapp: '5547999998008', setor: 'hospitalidade',
      porte: 'pequeno', status: 'verified', validationScore: 91,
      socialMedia: '{"instagram":"@serenitypousada"}',
      metadata: '{"city":"Gramado","state":"RS","rooms":14,"adr":320}',
    },
    {
      empresa: 'Vila do Mar', decisor: 'Beatriz Costa', cargo: 'Gerente Geral',
      email: 'beatriz@viladomar.com.br', whatsapp: '5571999999009', setor: 'hospitalidade',
      porte: 'grande', status: 'pending', validationScore: 55,
      socialMedia: '{}',
      metadata: '{"city":"Porto Seguro","state":"BA","rooms":28,"adr":260}',
    },
    {
      empresa: 'Chalé das Nuvens', decisor: 'André Souza', cargo: 'Proprietário',
      email: 'andre@nuvens.com.br', whatsapp: '5535999991010', setor: 'hospitalidade',
      porte: 'pequeno', status: 'converted', validationScore: 95,
      socialMedia: '{"instagram":"@chaledasnuvens"}',
      metadata: '{"city":"São Thomé das Letras","state":"MG","rooms":6,"adr":400}',
    },
    {
      empresa: 'Pousada do Caminho', decisor: 'Luciana Ferreira', cargo: 'Proprietária',
      email: 'luciana@caminho.com.br', whatsapp: '5521999991111', setor: 'hospitalidade',
      porte: 'pequeno', status: 'verified', validationScore: 76,
      socialMedia: '{"instagram":"@pousadadocaminho"}',
      metadata: '{"city":"Tiradentes","state":"MG","rooms":9,"adr":240}',
    },
    {
      empresa: 'Eco Pousada Canela', decisor: 'João Paulo Ribeiro', cargo: 'Diretor',
      email: 'joao@ecocanela.com.br', whatsapp: '5554999991212', setor: 'hospitalidade',
      porte: 'medio', status: 'verified', validationScore: 82,
      socialMedia: '{"instagram":"@ecocanela"}',
      metadata: '{"city":"Canela","state":"RS","rooms":16,"adr":290}',
    },
  ];

  for (const l of leads) {
    await db.lead.upsert({
      where: { email: l.email },
      update: l,
      create: l,
    });
  }
  console.log(`✅ ${leads.length} leads created`);

  // ===== SWIPE TEMPLATES =====
  const templates = [
    {
      name: 'Prospecção Premium',
      category: 'prospecção',
      content: 'Olá {{decisor}}! Sou da ZEHLA e notei que a {{empresa}} tem um potencial incrível em {{city}}. Fizemos um diagnóstico gratuito e encontramos oportunidades de aumento de receita de até {{boostPercent}}%. Posso te enviar?',
      variables: '["decisor","empresa","city","boostPercent"]',
      successRate: 12.5,
      usageCount: 342,
    },
    {
      name: 'Follow-up Diagnóstico',
      category: 'follow-up',
      content: '{{decisor}}, boa tarde! Nosso diagnóstico da {{empresa}} identificou que o {{gapDescription}}. Com IA da ZEHLA, isso pode ser resolvido automaticamente. Posso mostrar como?',
      variables: '["decisor","empresa","gapDescription"]',
      successRate: 18.3,
      usageCount: 187,
    },
    {
      name: 'Conversão Final',
      category: 'conversão',
      content: '{{decisor}}, seguindo nossa conversa sobre a {{empresa}} — o plano {{plan}} da ZEHLA inclui WhatsApp 24h, precificação dinâmica e controle total de reservas. Setup em 10 minutos. Vamos começar?',
      variables: '["decisor","empresa","plan"]',
      successRate: 24.7,
      usageCount: 89,
    },
    {
      name: 'Reativação 30 dias',
      category: 'reativação',
      content: 'Olá {{decisor}}! Vi que a {{empresa}} ainda não ativa a automação. Pousadas como a sua em {{city}} aumentaram ocupação em 8% com a ZEHLA. Posso te mostrar o caso?',
      variables: '["decisor","empresa","city"]',
      successRate: 8.2,
      usageCount: 56,
    },
  ];

  for (const t of templates) {
    await db.swipeTemplate.upsert({
      where: { id: t.name.toLowerCase().replace(/\s+/g, '-') },
      update: t,
      create: { id: t.name.toLowerCase().replace(/\s+/g, '-'), ...t },
    });
  }
  console.log(`✅ ${templates.length} swipe templates created`);

  // ===== CAMPAIGNS =====
  const campaigns = [
    {
      name: 'Campanha Búzios Q3 2026',
      type: 'whatsapp',
      status: 'active',
      targetAudience: 'leads',
      messageTemplate: 'Olá! Notamos que sua pousada em Búzios pode aumentar receita com IA.',
      scheduledAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      totalSent: 45,
      totalDelivered: 42,
      totalRead: 28,
      totalReplied: 8,
    },
    {
      name: 'Newsletter Diagnóstico Q3',
      type: 'email',
      status: 'active',
      targetAudience: 'verified',
      messageTemplate: 'Seu diagnóstico gratuito de receita está pronto.',
      scheduledAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      totalSent: 120,
      totalDelivered: 115,
      totalRead: 67,
      totalReplied: 19,
    },
  ];

  for (const c of campaigns) {
    await db.campaign.create({ data: c });
  }
  console.log(`✅ ${campaigns.length} campaigns created`);

  // ===== AGENT LOGS =====
  const agentLogs = [
    { agentId: 'lessie', action: 'hunt_started', inputTokens: 0, outputTokens: 0, latencyMs: 12, costUsd: 0, status: 'success' },
    { agentId: 'lessie', action: 'domain_resolved', inputTokens: 150, outputTokens: 45, latencyMs: 230, costUsd: 0.0001, status: 'success' },
    { agentId: 'lessie', action: 'email_extracted', inputTokens: 200, outputTokens: 89, latencyMs: 340, costUsd: 0.0002, status: 'success' },
    { agentId: 'lessie', action: 'whatsapp_validated', inputTokens: 180, outputTokens: 32, latencyMs: 180, costUsd: 0.0001, status: 'success' },
    { agentId: 'lessie', action: 'validation_completed', inputTokens: 250, outputTokens: 120, latencyMs: 450, costUsd: 0.0003, status: 'success' },
    { agentId: 'lessie', action: 'linkedin_scrape', inputTokens: 300, outputTokens: 200, latencyMs: 890, costUsd: 0.0005, status: 'success' },
    { agentId: 'lessie', action: 'social_footprint', inputTokens: 220, outputTokens: 150, latencyMs: 560, costUsd: 0.0003, status: 'success' },
    { agentId: 'diagnostic', action: 'revenue_diagnosis', inputTokens: 800, outputTokens: 650, latencyMs: 2340, costUsd: 0.0045, status: 'success' },
    { agentId: 'router', action: 'context_classified', inputTokens: 0, outputTokens: 0, latencyMs: 3, costUsd: 0, status: 'success' },
    { agentId: 'router', action: 'provider_selected', inputTokens: 0, outputTokens: 0, latencyMs: 8, costUsd: 0, status: 'success' },
  ];

  for (const log of agentLogs) {
    await db.agentLog.create({ data: log });
  }
  console.log(`✅ ${agentLogs.length} agent logs created`);

  // ===== ROUTER PROVIDERS =====
  const providers = [
    { provider: 'ollama-llama3', modelName: 'Llama 3.1 8B (Local)', tier: '1', alpha: 5.0, beta: 1.0, supportsJson: false, supportsTools: false, costPer1kInput: 0, costPer1kOutput: 0, maxContextTokens: 8192, avgLatencyMs: 133, successCount: 15, failureCount: 2 },
    { provider: 'groq-llama3-70b', modelName: 'Llama 3.3 70B', tier: '2', alpha: 4.0, beta: 1.0, supportsJson: true, supportsTools: false, costPer1kInput: 0.00059, costPer1kOutput: 0.00079, maxContextTokens: 32768, avgLatencyMs: 40, successCount: 28, failureCount: 1 },
    { provider: 'gemini-flash', modelName: 'Gemini 2.0 Flash', tier: '2', alpha: 3.0, beta: 1.0, supportsJson: true, supportsTools: true, costPer1kInput: 0.000075, costPer1kOutput: 0.0003, maxContextTokens: 65536, avgLatencyMs: 60, successCount: 22, failureCount: 3 },
    { provider: 'openrouter-gpt4o', modelName: 'GPT-4o', tier: '3', alpha: 4.0, beta: 1.0, supportsJson: true, supportsTools: true, costPer1kInput: 0.0025, costPer1kOutput: 0.01, maxContextTokens: 128000, avgLatencyMs: 80, successCount: 35, failureCount: 2 },
    { provider: 'anthropic-claude', modelName: 'Claude Sonnet 4', tier: '3', alpha: 3.5, beta: 1.0, supportsJson: true, supportsTools: true, costPer1kInput: 0.003, costPer1kOutput: 0.015, maxContextTokens: 200000, avgLatencyMs: 90, successCount: 30, failureCount: 1 },
  ];

  for (const p of providers) {
    await db.routerProvider.upsert({
      where: { provider: p.provider },
      update: p,
      create: p,
    });
  }
  console.log(`✅ ${providers.length} router providers created`);

  console.log('\n🎉 Seed completed successfully!');
}

seed()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => { db.$disconnect(); });
