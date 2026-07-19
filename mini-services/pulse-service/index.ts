// ═══════════════════════════════════════════════════════════════════════════════
// ZÉLLA Pulse Service — Socket.io Real-Time for ZCC Mission Control
// ═══════════════════════════════════════════════════════════════════════════════
// Port: 3003 | Bidirectional WebSocket for Pulse Check + Command Interface
// ═══════════════════════════════════════════════════════════════════════════════

import { Server } from 'socket.io';

const PORT = 3004;

// ── Types ──────────────────────────────────────────────────────────────────────

interface PulseAlert {
  id: string;
  timestamp: string;
  container: string;
  severity: 'ALTA' | 'MÉDIA' | 'BAIXA';
  title: string;
  stackTrace: string;
  arquivo_linha: string;
  impacto_usuario: string;
  causa_raiz: string;
  codigo_solucao: string;
  aiAnalyzed: boolean;
  resolved: boolean;
}

interface VPSMetricsPayload {
  cpuUsage: number;
  cpuCores: number;
  ramUsed: number;
  ramTotal: number;
  diskUsed: number;
  diskTotal: number;
  loadAvg: [number, number, number];
  networkIn: number;
  networkOut: number;
  timestamp: string;
}

interface ContainerPayload {
  name: string;
  service: string;
  status: 'running' | 'stopped' | 'restarting';
  uptime: string;
  cpu: number;
  memory: number;
  port: number;
  image: string;
}

type CommandType = 'clear_cache' | 'restart_agent' | 'pause_tenant' | 'force_container_restart';

interface CommandPayload {
  type: CommandType;
  target: string;
  confirmToken?: string;
}

interface CommandResult {
  success: boolean;
  message: string;
  target: string;
  type: string;
  timestamp: string;
}

// ── Nuclear Option Confirmation Token ──────────────────────────────────────────

const NUCLEAR_TOKEN = 'zella-nuclear-2026';

// ── Mock Data Generators ──────────────────────────────────────────────────────

const containers: ContainerPayload[] = [
  { name: 'zella-app', service: 'Next.js App', status: 'running', uptime: '14d 6h', cpu: 12, memory: 340, port: 3000, image: 'zella:latest' },
  { name: 'zella-postgres', service: 'PostgreSQL', status: 'running', uptime: '14d 6h', cpu: 4, memory: 512, port: 5432, image: 'postgres:16' },
  { name: 'zella-redis', service: 'Redis Cache', status: 'running', uptime: '14d 6h', cpu: 1, memory: 128, port: 6379, image: 'redis:7-alpine' },
  { name: 'zella-evolution', service: 'Evolution API', status: 'running', uptime: '3d 12h', cpu: 8, memory: 456, port: 8080, image: 'atticus/evolution-api:latest' },
  { name: 'zella-nginx', service: 'Nginx Proxy', status: 'running', uptime: '14d 6h', cpu: 1, memory: 64, port: 80, image: 'nginx:alpine' },
  { name: 'zella-bullmq', service: 'BullMQ Worker', status: 'running', uptime: '14d 6h', cpu: 3, memory: 96, port: 0, image: 'zella-worker:latest' },
];

let vpsState: VPSMetricsPayload = {
  cpuUsage: 23, cpuCores: 4, ramUsed: 3.2, ramTotal: 8,
  diskUsed: 42, diskTotal: 100, loadAvg: [0.8, 0.6, 0.5],
  networkIn: 12, networkOut: 8, timestamp: new Date().toISOString(),
};

let alertCounter = 0;

const errorTemplates: Omit<PulseAlert, 'id' | 'timestamp' | 'aiAnalyzed' | 'resolved'>[] = [
  {
    container: 'zella-evolution',
    severity: 'ALTA',
    title: 'Evolution API — WebSocket desconectado do Meta',
    stackTrace: `Error: Connection reset by peer
    at TLSSocket.onConnectReset (node:net:1630:25)
    at TLSSocket.emit (node:events:514:28)
    at emitErrorNT (node:internal/streams/destroy:151:8)
    at EvolutionClient.connect (src/services/EvolutionClient.ts:142:11)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)`,
    arquivo_linha: 'src/services/EvolutionClient.ts:142',
    impacto_usuario: 'Hóspedes não recebem respostas no WhatsApp — fila de mensagens acumulando',
    causa_raiz: 'Token de sessão do Meta expirado sem renovação automática',
    codigo_solucao: `// EvolutionClient.ts — Adicionar reconexão automática\nprivate async handleDisconnect() {\n  console.warn('[Evolution] Disconnected, scheduling reconnect...');\n  await this.refreshSessionToken();\n  setTimeout(() => this.connect(), 5000);\n}`,
  },
  {
    container: 'zella-app',
    severity: 'MÉDIA',
    title: 'Rate Limit atingido na rota /api/brain',
    stackTrace: `Error: Too Many Requests — 429
    at RateLimiter.check (src/middleware/rateLimiter.ts:45:13)
    at Layer.handle (node_modules/express/lib/router/layer.js:95:5)
    at next (node_modules/express/lib/router/route.js:149:13)`,
    arquivo_linha: 'src/middleware/rateLimiter.ts:45',
    impacto_usuario: 'Respostas de IA demoram mais que o normal para alguns anfitriões',
    causa_raiz: 'Burst de requisições de um único tenant PRO com alta demanda',
    codigo_solucao: `// rateLimiter.ts — Implementar sliding window com burst\nconst limiter = rateLimit({\n  windowMs: 60 * 1000,\n  max: (req) => req.tenant?.plan === 'MAX' ? 200 : 100,\n  skip: (req) => req.tenant?.plan === 'MAX'\n});`,
  },
  {
    container: 'zella-postgres',
    severity: 'ALTA',
    title: 'Deadlock detectado na tabela reservations',
    stackTrace: `Prisma.PrismaClientKnownRequestError: Transaction failed due to a write conflict
    at PrismaClient._request (node_modules/@prisma/client/runtime/library.js:155:11)
    at async createReservation (src/services/BookingService.ts:89:18)
    at async processWebhook (src/api/webhook-whatsapp/route.ts:67:14)`,
    arquivo_linha: 'src/services/BookingService.ts:89',
    impacto_usuario: 'Reserva duplicada possível — hóspede pode receber confirmação fantasma',
    causa_raiz: 'Duas threads tentando atualizar disponibilidade do mesmo quarto simultaneamente',
    codigo_solucao: `// BookingService.ts — Usar transação serializável\nawait prisma.$transaction(async (tx) => {\n  const room = await tx.room.findUnique({ where: { id } });\n  if (room.available) {\n    await tx.reservation.create({ data: bookingData });\n    await tx.room.update({ where: { id }, data: { available: false } });\n  }\n}, { isolationLevel: 'Serializable' });`,
  },
  {
    container: 'zella-redis',
    severity: 'BAIXA',
    title: 'Cache miss rate acima de 70% no namespace brain:',
    stackTrace: `Warning: Cache miss ratio 0.73 exceeds threshold
    at CacheMonitor.check (src/lib/cache-monitor.ts:23:9)
    at interval (src/lib/cache-monitor.ts:15:5)`,
    arquivo_linha: 'src/lib/cache-monitor.ts:23',
    impacto_usuario: 'Latência aumentada nas respostas do Cérebro — sem impacto visível ainda',
    causa_raiz: 'TTL do cache muito baixo (60s) para padrões de acesso do Brain',
    codigo_solucao: `// cache-config.ts — Ajustar TTL por padrão de uso\nconst CACHE_TTL = {\n  brain_response: 300,   // 5min (era 60s)\n  faq_context: 600,     // 10min\n  pricing_rules: 180,   // 3min\n};`,
  },
  {
    container: 'zella-bullmq',
    severity: 'MÉDIA',
    title: 'Worker travado — Fila de PIX com 47 jobs pendentes',
    stackTrace: `Error: Job stalled — no progress for 120s
    at Worker.processJob (node_modules/bullmq/dist/esm/classes/worker.js:392:15)
    at async RetryManager.execute (src/services/PaymentWorker.ts:56:9)`,
    arquivo_linha: 'src/services/PaymentWorker.ts:56',
    impacto_usuario: 'Hóspedes aguardando confirmação de pagamento PIX por mais de 2 minutos',
    causa_raiz: 'Worker não está processando o callback do Mercado Pago',
    codigo_solucao: `// PaymentWorker.ts — Adicionar timeout e retry\nconst worker = new Worker('pix-queue', processor, {\n  concurrency: 5,\n  lockDuration: 30000,\n  stalledInterval: 15000,\n  maxStalledCount: 3,\n});`,
  },
];

function generateAlert(): PulseAlert {
  const template = errorTemplates[alertCounter % errorTemplates.length];
  alertCounter++;
  return {
    ...template,
    id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    aiAnalyzed: true,
    resolved: false,
  };
}

function fluctuateVPS(): VPSMetricsPayload {
  vpsState = {
    ...vpsState,
    cpuUsage: Math.max(5, Math.min(95, vpsState.cpuUsage + (Math.random() - 0.5) * 6)),
    ramUsed: Math.max(2, Math.min(7, vpsState.ramUsed + (Math.random() - 0.5) * 0.2)),
    networkIn: Math.max(5, vpsState.networkIn + (Math.random() - 0.5) * 4),
    networkOut: Math.max(3, vpsState.networkOut + (Math.random() - 0.5) * 3),
    timestamp: new Date().toISOString(),
  };
  return vpsState;
}

function fluctuateContainers(): ContainerPayload[] {
  return containers.map(c => ({
    ...c,
    cpu: Math.max(0, Math.min(100, c.cpu + Math.round((Math.random() - 0.5) * 4))),
    memory: Math.max(32, c.memory + Math.round((Math.random() - 0.5) * 20)),
  }));
}

// ── Socket.io Server ───────────────────────────────────────────────────────────

const io = new Server(PORT, {
  cors: {
    origin: ['http://localhost:3000', 'https://smart-hotel-zehla.vercel.app'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

console.log(`🟢 [Pulse Service] Socket.io server running on port ${PORT}`);

// ── Connection Handling ────────────────────────────────────────────────────────

io.on('connection', (socket) => {
  console.log(`📡 [Pulse] Client connected: ${socket.id}`);

  // ── Subscribe to pulse alerts ──
  socket.on('zcc:subscribe', () => {
    console.log(`📡 [Pulse] ${socket.id} subscribed to pulse alerts`);
    socket.join('zcc-ops');
    // Send current state immediately
    socket.emit('pulse:metrics', { vps: fluctuateVPS(), containers: fluctuateContainers() });
  });

  // ── Command execution ──
  socket.on('zcc:command', async (payload: CommandPayload) => {
    console.log(`⚡ [Pulse] Command received: ${payload.type} → ${payload.target}`);
    const result = await executeCommand(payload);
    socket.emit('command:result', result);
    io.to('zcc-ops').emit('command:result', result);
  });

  // ── AI Analysis request ──
  socket.on('zcc:request_analysis', (alertId: string) => {
    console.log(`🧠 [Pulse] AI analysis requested for: ${alertId}`);
    // Simulate AI analysis delay
    setTimeout(() => {
      socket.emit('analysis:result', {
        alertId,
        analysis: 'Análise completa — causa raiz identificada com 94% de confiança',
        confidence: 0.94,
        tokensUsed: 1847,
        timestamp: new Date().toISOString(),
      });
    }, 2000);
  });

  // ── Disconnect ──
  socket.on('disconnect', (reason) => {
    console.log(`📡 [Pulse] Client disconnected: ${socket.id} (${reason})`);
  });
});

// ── Command Execution ──────────────────────────────────────────────────────────

async function executeCommand(payload: CommandPayload): Promise<CommandResult> {
  const base = {
    target: payload.target,
    type: payload.type,
    timestamp: new Date().toISOString(),
  };

  switch (payload.type) {
    case 'clear_cache':
      await delay(1000);
      return { ...base, success: true, message: `Cache Redis limpo para padrão: ${payload.target}` };

    case 'restart_agent':
      await delay(2000);
      return { ...base, success: true, message: `Agente "${payload.target}" reiniciado com sucesso` };

    case 'pause_tenant':
      await delay(1500);
      return { ...base, success: true, message: `Tenant "${payload.target}" pausado (Kill Switch ativo)` };

    case 'force_container_restart':
      if (payload.confirmToken !== NUCLEAR_TOKEN) {
        return { ...base, success: false, message: 'OPERAÇÃO NEGADA — Token de confirmação inválido. Comando nuclear requer autenticação dupla.' };
      }
      await delay(3000);
      return { ...base, success: true, message: `Container "${payload.target}" reiniciado via Docker API — operação nuclear executada` };

    default:
      return { ...base, success: false, message: `Comando desconhecido: ${payload.type}` };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Periodic Broadcasts ────────────────────────────────────────────────────────

// VPS metrics every 3 seconds
setInterval(() => {
  io.to('zcc-ops').emit('pulse:metrics', {
    vps: fluctuateVPS(),
    containers: fluctuateContainers(),
  });
}, 3000);

// Error alerts every 15-25 seconds (random)
function scheduleAlert() {
  const interval = 15000 + Math.random() * 10000;
  setTimeout(() => {
    const alert = generateAlert();
    console.log(`🚨 [Pulse] Alert generated: [${alert.severity}] ${alert.title}`);
    io.to('zcc-ops').emit('pulse:alert', alert);
    scheduleAlert();
  }, interval);
}
scheduleAlert();

// Container status updates every 5 seconds
setInterval(() => {
  io.to('zcc-ops').emit('pulse:containers', fluctuateContainers());
}, 5000);

console.log(`🟢 [Pulse Service] Periodic broadcasts active — metrics @ 3s, alerts @ ~20s`);
