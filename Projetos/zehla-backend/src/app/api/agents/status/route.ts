import { NextResponse } from 'next/server';

import { withApiSecurity } from '@/lib/server/with-api-security';

export interface AgentStatusEntry {
  code: string;
  name: string;
  status: 'active' | 'idle' | 'error';
  lastActiveAt: string;
  lastAction: string;
  tasksCompletedToday: number;
  trendsSignalsConsumed: number;
  isEnabled: boolean;
}

const agentsStatus: AgentStatusEntry[] = [
  { code: 'REV', name: 'Revenue', status: 'active', lastActiveAt: new Date().toISOString(), lastAction: 'Dynamic pricing adjusted — suite rates +12%', tasksCompletedToday: 47, trendsSignalsConsumed: 182, isEnabled: true },
  { code: 'MKT', name: 'Marketing', status: 'idle', lastActiveAt: new Date(Date.now() - 45 * 60000).toISOString(), lastAction: 'Campaign ROI report generated', tasksCompletedToday: 12, trendsSignalsConsumed: 64, isEnabled: true },
  { code: 'WPP', name: 'WhatsApp', status: 'active', lastActiveAt: new Date().toISOString(), lastAction: 'Bulk message delivered — 234 recipients', tasksCompletedToday: 89, trendsSignalsConsumed: 210, isEnabled: true },
  { code: 'ANA', name: 'Analytics', status: 'active', lastActiveAt: new Date(Date.now() - 2 * 60000).toISOString(), lastAction: 'Occupancy forecast updated — Q3 2026', tasksCompletedToday: 34, trendsSignalsConsumed: 156, isEnabled: true },
  { code: 'FIN', name: 'Financial', status: 'active', lastActiveAt: new Date(Date.now() - 5 * 60000).toISOString(), lastAction: 'PIX reconciliation completed — 18 transactions', tasksCompletedToday: 56, trendsSignalsConsumed: 93, isEnabled: true },
  { code: 'RES', name: 'Reservations', status: 'active', lastActiveAt: new Date(Date.now() - 1 * 60000).toISOString(), lastAction: 'Auto check-in processed — room 204, Silva', tasksCompletedToday: 73, trendsSignalsConsumed: 128, isEnabled: true },
  { code: 'SEC', name: 'Security', status: 'active', lastActiveAt: new Date(Date.now() - 10 * 60000).toISOString(), lastAction: 'LGPD audit passed — 0 violations detected', tasksCompletedToday: 21, trendsSignalsConsumed: 45, isEnabled: true },
  { code: 'OPN', name: 'Operations', status: 'idle', lastActiveAt: new Date(Date.now() - 120 * 60000).toISOString(), lastAction: 'Housekeeping dispatch — 7 rooms scheduled', tasksCompletedToday: 38, trendsSignalsConsumed: 71, isEnabled: true },
  { code: 'SWP', name: 'Swap', status: 'error', lastActiveAt: new Date(Date.now() - 240 * 60000).toISOString(), lastAction: 'Integration sync failed — Evolution API timeout', tasksCompletedToday: 5, trendsSignalsConsumed: 12, isEnabled: false },
  { code: 'HRD', name: 'Human Resources', status: 'idle', lastActiveAt: new Date(Date.now() - 90 * 60000).toISOString(), lastAction: 'Shift schedule compiled — night team active', tasksCompletedToday: 9, trendsSignalsConsumed: 23, isEnabled: true },
];

async function _GET(): Promise<NextResponse> {
  try {
    const summary = {
      total: agentsStatus.length,
      active: agentsStatus.filter(a => a.status === 'active').length,
      idle: agentsStatus.filter(a => a.status === 'idle').length,
      error: agentsStatus.filter(a => a.status === 'error').length,
      tasksToday: agentsStatus.reduce((sum, a) => sum + a.tasksCompletedToday, 0),
      signalsConsumed: agentsStatus.reduce((sum, a) => sum + a.trendsSignalsConsumed, 0),
    };

    return NextResponse.json({ agents: agentsStatus, summary });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });

async function _PATCH(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const { code, isEnabled } = body;

    if (!code || typeof isEnabled !== 'boolean') {
      return NextResponse.json({ error: 'Bad Request — code and isEnabled required' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Agent ${code} ${isEnabled ? 'enabled' : 'disabled'}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}

export const PATCH = withApiSecurity(_PATCH, { rateLimit: { limit: 100, windowSeconds: 60 } });
