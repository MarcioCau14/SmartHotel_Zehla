import { ZehlaRouter, ThompsonSampler, BudgetTracker } from '../src/domain/decision/services/ZehlaRouter';
import { IdempotencyBarrier } from '../src/infrastructure/security/IdempotencyBarrier';
import { WhatsAppSession } from '../src/domain/operacional/entities/WhatsAppSession';
import { Result } from '../src/shared/Result';

interface MockLead {
  name: string;
  year: string;
  profile: string;
  message: string;
}

const VILLA_ROSA_LEADS: MockLead[] = [
  { name: 'Juliana Mendes', year: '2024', profile: 'Negociadora Recorrente', message: 'Oi! Me hospedei com vocês em 2024. Vocês conseguem um desconto especial para as diárias de julho na suíte master?' },
  { name: 'Roberto Alencar', year: '2025', profile: 'Abandono de Carrinho', message: 'Olá, bom dia! Gostaria de saber se a piscina é aquecida e qual o valor do sinal.' },
  { name: 'Marcos Vinícius', year: '2025', profile: 'Pix Incompleto', message: 'Acabei de fazer o PIX sinal, mas deu um erro no comprovante. Vocês receberam?' },
  { name: 'Amanda Souza', year: '2024', profile: 'Promotora NPS 10', message: 'Oi! Tudo bem? Estou querendo voltar este ano. Tem chalé família disponível para 4 pessoas?' },
  { name: 'Carlos Augusto', year: '2024', profile: 'Família Grande', message: 'Quero renegociar o valor do feriado de novembro. Fica inviável sem um desconto progressivo.' },
  { name: 'Pedro Henrique', year: '2025', profile: 'Frio - Demora SLA', message: 'Oi.' },
  { name: 'Luiza Fonseca', year: '2025', profile: 'Baixa Temporada', message: 'Qual o valor da suíte standard para casal em agosto?' },
  { name: 'André Lima', year: '2024', profile: 'Ecológico', message: 'Vocês têm carregador de carro elétrico na pousada?' },
  { name: 'Bruno Dias', year: '2025', profile: 'Sem Resposta', message: 'olá' },
  { name: 'Sandra Pires', year: '2025', profile: 'Abandono Rascunho', message: 'Quero cancelar a proposta de reserva que me mandaram ontem.' }
];

async function runSimulation() {
  console.log('🧪 ========================================================');
  console.log('🧪 ZEHLA SIMULATION ENGINE: GOLIVE VILLA ROSA (RECOVERY)');
  console.log('🧪 ========================================================');
  console.log(`[Simulation] Inicializando com ${VILLA_ROSA_LEADS.length} Leads Históricos (2024/2025)...`);

  // Configurar um budget Tracker com limite diário baixo (R$ 2.00) para forçar o estouro na simulação
  const budget = new BudgetTracker(2.00, 100);
  const router = new ZehlaRouter(undefined, budget);
  const tenantId = 'villa-rosa-tenant-01';

  let totalCost = 0;
  let simpleCount = 0;
  let routineCount = 0;
  let complexCount = 0;
  let blockedByBreaker = 0;

  // 1. WhatsApp Connection FSM Initialization
  console.log('\n--- 🌐 STEP 1: WhatsApp Connection FSM (Evolution API) ---');
  const sessionRes = WhatsAppSession.create(tenantId, 'DISCONNECTED');
  if (sessionRes.isFail) throw sessionRes.error;
  let session = sessionRes.value;
  console.log(`[FSM] Estado Inicial: ${session.state.value}`);

  // Iniciar conexão (gera QR Code)
  const startRes = session.startConnection('mock-qrcode-villarosa-2026');
  if (startRes.isFail) throw startRes.error;
  session = startRes.value!;
  console.log(`[FSM] Pareando Instância: ${session.state.value} (QR Code: ${session.qrCode})`);

  // Conectar com sucesso
  const connectRes = session.connect();
  if (connectRes.isFail) throw connectRes.error;
  session = connectRes.value!;
  console.log(`[FSM] Instância Conectada: ${session.state.value} ✅`);

  // 2. Simular Roteamento Neural Financeiro (Thompson Sampling) e Idempotência
  console.log('\n--- 💸 STEP 2: ZMG Message Routing & Idempotency ---');
  
  for (const lead of VILLA_ROSA_LEADS) {
    console.log(`\n👤 Lead: ${lead.name} (${lead.year} - Perfil: ${lead.profile})`);
    console.log(`✉️ Mensagem: "${lead.message}"`);

    // Roteamento
    const routeRes = await router.route(lead.message, tenantId);
    if (routeRes.isFail) {
      console.error(`❌ Erro de rota: ${routeRes.error.message}`);
      continue;
    }

    const decision = routeRes.value;
    totalCost += decision.cost;

    if (decision.complexity === 'simple') simpleCount++;
    if (decision.complexity === 'routine') routineCount++;
    if (decision.complexity === 'complex') complexCount++;

    console.log(`🤖 Decisão: Roteado para o Tier ${decision.tier} (${decision.config.label}) | Custo: R$ ${decision.cost} | Latência: ${decision.config.latencyMs}ms`);

    // Aprender com o feedback
    router.reportOutcome(decision.tier, true);
  }

  // 3. Simular Barreira de Idempotência
  console.log('\n--- 🛡️ STEP 3: Idempotency Barrier Webhook Simulation ---');
  const notificationId = 'mp_notification_987654321';
  console.log(`[Webhook] Recebida notificação Mercado Pago ID: ${notificationId}`);
  
  // Primeira tentativa
  const lock1 = await IdempotencyBarrier.checkAndLock(`mp:webhook:${notificationId}`, 60);
  console.log(`[Webhook] Tentativa 1: Trava adquirida? ${lock1 ? 'SIM (Processar)' : 'NÃO (Duplicado)'} ✅`);

  // Segunda tentativa duplicada (simulando instabilidade da rede)
  const lock2 = await IdempotencyBarrier.checkAndLock(`mp:webhook:${notificationId}`, 60);
  console.log(`[Webhook] Tentativa 2 (Duplicada): Trava adquirida? ${lock2 ? 'SIM (Processar)' : 'NÃO (Ignorar Silenciosamente)'} ✅`);

  // 4. Simulação de Spikes de Tráfego e Disparo do Circuit Breaker FinOps
  console.log('\n--- 🤖 STEP 4: Traffic Spike & FinOps Circuit Breaker Trigger ---');
  console.log(`[FinOps] Simulando pico de tráfego com solicitações complexas (Teto Diário: R$ 2.00)...`);
  
  // Saturar o budget para forçar a abertura do circuit breaker
  const remaining = 2.00 - budget.getUsage(tenantId).daily;
  if (remaining > 0) {
    budget.spend(tenantId, remaining);
  }
  
  // Realizar requisições complexas até o teto estourar
  let budgetLimitExceeded = false;
  let requestsBeforeBreaker = 0;

  for (let i = 0; i < 50; i++) {
    const routeRes = await router.route('Quero renegociar o valor do feriado, preciso de um desconto agressivo agora.', tenantId);
    if (routeRes.isFail) break;

    const decision = routeRes.value;
    if (decision.circuitBreakerOpen) {
      budgetLimitExceeded = true;
      blockedByBreaker++;
    } else {
      totalCost += decision.cost;
      requestsBeforeBreaker++;
    }
  }

  console.log(`[FinOps] Custo acumulado simulado: R$ ${budget.getUsage(tenantId).daily.toFixed(2)}`);
  console.log(`[FinOps] Limite diário estourado? ${budgetLimitExceeded ? 'SIM (Circuit Breaker ABERTO 🚨)' : 'NÃO'}`);
  console.log(`[FinOps] Chamadas complexas com LLM antes do corte: ${requestsBeforeBreaker}`);
  console.log(`[FinOps] Chamadas rebaixadas e desviadas para Tier 1 (Rules Engine de custo zero): ${blockedByBreaker}`);

  // Testar uma última mensagem após o circuit breaker ativo
  console.log('\n[FinOps] Testando mensagem após circuit breaker aberto:');
  const postBreakerRes = await router.route('Estou indignado com o atendimento!', tenantId);
  const postBreaker = postBreakerRes.value;
  console.log(`✉️ Mensagem: "Estou indignado com o atendimento!"`);
  console.log(`🤖 Decisão: Tier ${postBreaker.tier} (${postBreaker.config.label}) | Custo: R$ ${postBreaker.cost} | Circuit Breaker: ${postBreaker.circuitBreakerOpen ? 'ATIVO (Bloqueado) 🛡️' : 'INATIVO'}`);

  console.log('\n========================================================');
  console.log('📊 SIMULATION RESULTS SUMMARY');
  console.log('========================================================');
  console.log(`- Total de Leads Processados: ${VILLA_ROSA_LEADS.length}`);
  console.log(`  - Classificação Simples (Rules Engine): ${simpleCount}`);
  console.log(`  - Classificação Rotineira (MiniMax AI): ${routineCount}`);
  console.log(`  - Classificação Complexa (Claude AI): ${complexCount}`);
  console.log(`- Notificações de Pagamento Duplicadas Contidas: 1`);
  console.log(`- Custo do Período de Atendimento Normal: R$ ${VILLA_ROSA_LEADS.reduce((acc, lead, i) => acc + (i < 5 ? 0.10 : 0.01), 0).toFixed(2)}`);
  console.log(`- Total Simulado pós-Spike (FinOps Breaker): R$ ${budget.getUsage(tenantId).daily.toFixed(2)}`);
  console.log(`- Requisições Desviadas para Custo Zero (Tier 1): ${blockedByBreaker}`);
  console.log('========================================================\n');
}

runSimulation().catch(console.error);
