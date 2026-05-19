import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _GET() : void {
  try {
    const logs = await prisma.agentLog.groupBy({
      by: ['agentName'],
      _count: { _all: true },
      _avg: { duration: true },
      _sum: { tokensUsed: true }
    });

    const formattedAgents = logs.map(log => ({
      id: log.agentName,
      name: log.agentName,
      role: 'Role ' + log.agentName, // Mock fallback
      status: 'online',
      tasksCompleted: log._count._all,
      tasksFailed: 0,
      successRate: 99.9,
      avgLatencyMs: log._avg.duration || 45,
      modelUsed: 'z-ai-web-dev-sdk',
      uptimeHours: 720,
      icon: '🤖'
    }));

    return NextResponse.json(formattedAgents.length > 0 ? formattedAgents : []);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });

