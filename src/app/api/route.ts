import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    api: 'ZEHLA SmartHotel API',
    version: '2.0',
    description: 'Plataforma de Automação Comercial, Marketing e Hospitalidade para Pousadas',
    endpoints: {
      total: 54,
      groups: {
        health: ['GET /api/health', 'GET /api/readiness'],
        leads: ['GET /api/leads', 'POST /api/leads', 'GET /api/leads/[id]', 'PATCH /api/leads/[id]', 'DELETE /api/leads/[id]'],
        campaigns: ['GET /api/campaigns', 'POST /api/campaigns', 'GET /api/campaigns/[id]', 'PATCH /api/campaigns/[id]'],
        targets: ['GET /api/targets', 'POST /api/targets', 'GET /api/targets/[id]', 'PATCH /api/targets/[id]'],
        hunt: ['GET /api/hunt', 'GET /api/hunt-stream'],
        dashboard: ['GET /api/dashboard/overview', 'GET /api/dashboard/bookings'],
        agent: ['GET /api/agents', 'GET /api/agent-logs', 'POST /api/debug-agent', 'POST /api/debug-agent/github', 'POST /api/debug-agent/knowledge'],
        brain: ['POST /api/brain', 'GET /api/brain/health', 'GET /api/brain/intents'],
        checkout: ['POST /api/checkout/create', 'GET /api/checkout/success', 'POST /api/checkout/upgrade', 'POST /api/checkout/downgrade'],
        ddc: ['GET /api/ddc/guests', 'GET /api/ddc/bookings', 'GET /api/ddc/conversations', 'GET /api/ddc/metrics', 'GET /api/ddc/notifications', 'GET /api/ddc/ai-status', 'GET /api/ddc/training'],
        zcc: ['GET /api/zcc/dashboard-stats', 'GET /api/zcc/campaigns', 'GET /api/zcc/stats', 'GET /api/zcc/targets'],
        cron: ['GET /api/cron/budget-reset', 'GET /api/cron/metrics-snapshot'],
        export: ['POST /api/export/leads'],
        download: ['GET /api/download/[filename]'],
      },
    },
  });
}
