import { NextResponse } from 'next/server';

import { CognitiveTerminal } from '@/lib/observability/cognitive-terminal';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { withApiSecurity } from '@/lib/server/with-api-security';

export const dynamic = 'force-dynamic';

type HealAction =
  | 'restart_worker'
  | 'flush_queue'
  | 'clear_cache'
  | 'reset_connections'
  | 'force_gc';

const HEAL_ACTIONS: Record<HealAction, { label: string; description: string }> = {
  restart_worker: { label: 'Reiniciar Workers', description: 'Reinicia todos os workers BullMQ pendentes' },
  flush_queue: { label: 'Esvaziar Fila', description: 'Remove jobs travados de todas as filas' },
  clear_cache: { label: 'Limpar Cache Redis', description: 'Remove todas as chaves de cache no Redis' },
  reset_connections: { label: 'Resetar Conexões', description: 'Força reset do pool de conexões do Prisma' },
  force_gc: { label: 'Forçar Garbage Collection', description: 'Solicita coleta de lixo no V8 (Node)' },
};

async function _GET() {
  try {
  const actions = await prisma.systemLog.findMany({
      where: {
        component: 'SELF-HEALING',
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({
      actions: actions.map(a => ({
        id: a.id,
        level: a.level,
        component: a.component,
        message: a.message,
        metadata: a.metadata ? JSON.parse(a.metadata) : null,
        createdAt: a.createdAt,
      })),
      availableActions: Object.entries(HEAL_ACTIONS).map(([id, config]) => ({ id, ...config })),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch healing actions' }, { status: 500 });
  }
}

async function _POST(req: Request) {
  try {
  const { action, target } = await req.json() as { action: HealAction; target?: string };

    if (!HEAL_ACTIONS[action]) {
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    let result: string;

    switch (action) {
      case 'restart_worker': {
        await redis.del('brain:worker:heartbeat');
        result = 'Workers reiniciados. Heartbeat resetado.';
        break;
      }
      case 'flush_queue': {
        const { captureQueue, validateQueue, enrichQueue, classifyQueue, actQueue } = await import('@/lib/queues');
        const queues = [captureQueue, validateQueue, enrichQueue, classifyQueue, actQueue];
        for (const q of queues) {
          await q.drain();
        }
        result = `Filas esvaziadas com sucesso.`;
        break;
      }
      case 'clear_cache': {
        const keys = await redis.keys('cache:*');
        if (keys.length > 0) await redis.del(...keys);
        result = `${keys.length} chaves de cache removidas.`;
        break;
      }
      case 'reset_connections': {
        const { prisma: db } = await import('@/lib/prisma');
        await db.$disconnect();
        await db.$connect();
        result = 'Pool de conexões do Prisma resetado.';
        break;
      }
      case 'force_gc': {
        if (global.gc) {
          global.gc();
          result = 'Garbage Collection forçado.';
        } else {
          result = 'GC não disponível (rode com --expose-gc).';
        }
        break;
      }
      default:
        result = 'Ação não reconhecida.';
    }

    await CognitiveTerminal.success('SELF-HEALING', `Ação manual: ${HEAL_ACTIONS[action].label} — ${result}`, { action, target });

    return NextResponse.json({ success: true, action, result });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to execute healing action', details: String(error) },
      { status: 500 }
    );
  }
}

export const GET = withApiSecurity(_GET, { rateLimit: { limit: 30, windowSeconds: 60 } });
export const POST = withApiSecurity(_POST, { rateLimit: { limit: 10, windowSeconds: 60 } });
