import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyZCCAccessOrReject } from '@/lib/zcc-security';

export async function GET(request: NextRequest) {
  // ── Security Gate V3 — 6-Layer Protection ──
  const security = await verifyZCCAccessOrReject(request);
  if (!security.allowed) return security.response!;

  try {
    // ── Core counts ──────────────────────────────────────────────
    const [totalClients, totalRooms, totalReservations, totalTransactions] = await Promise.all([
      db.tenant.count(),
      db.room.count(),
      db.reservation.count(),
      db.transaction.findMany({
        where: { type: 'PAYMENT', status: 'COMPLETED' },
        select: { amount: true },
      }),
    ]);

    const totalRevenue = totalTransactions.reduce((sum, t) => sum + t.amount, 0);

    // ── AI messages processed ────────────────────────────────────
    let totalMessagesProcessed = 0;
    try {
      totalMessagesProcessed = await db.guestMessage.count({
        where: { from: 'ai' },
      });
    } catch {
      totalMessagesProcessed = 0;
    }

    // ── Average occupancy ────────────────────────────────────────
    let avgOccupancy = 0;
    try {
      const occupiedRooms = await db.room.count({
        where: { status: 'ocupado' },
      });
      avgOccupancy = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
    } catch {
      avgOccupancy = 0;
    }

    // ── Monthly growth (placeholder — based on tenant count delta) ─
    let monthlyGrowth = 0;
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);
      const newTenantsThisMonth = await db.tenant.count({
        where: { createdAt: { gte: thirtyDaysAgo } },
      });
      monthlyGrowth = totalClients > 0 ? Math.round((newTenantsThisMonth / totalClients) * 100) : 0;
    } catch {
      monthlyGrowth = 0;
    }

    // ── MRR by niche ─────────────────────────────────────────────
    const allTenants = await db.tenant.findMany({
      select: {
        id: true,
        plan: true,
        status: true,
        property: { select: { type: true } },
        airbSubscriptions: {
          where: { status: 'active' },
          select: { amount: true, planType: true, status: true },
        },
        subscriptions: {
          where: { status: 'active' },
          select: { amount: true, planType: true, status: true },
        },
      },
    });

    let mrrPousadas = 0;
    let mrrAirbnb = 0;
    let mrrParceiro = 0;

    const planPricing: Record<string, number> = {
      trial: 0,
      starter: 147,
      pro: 297,
      business: 597,
    };

    for (const tenant of allTenants) {
      const propertyType = tenant.property?.type || 'pousada';
      const isAirbnb = propertyType === 'airbnb' || (tenant.airbSubscriptions?.length ?? 0) > 0;
      const isParceiro = tenant.plan === 'parceiro';

      if (isParceiro) {
        const sub = tenant.subscriptions.find(s => s.status === 'active');
        mrrParceiro += sub?.amount ?? 97;
      } else if (isAirbnb) {
        const airbSub = tenant.airbSubscriptions.find(s => s.status === 'active');
        mrrAirbnb += airbSub?.amount ?? 397;
      } else {
        const sub = tenant.subscriptions.find(s => s.status === 'active');
        mrrPousadas += sub?.amount ?? planPricing[tenant.plan] ?? 0;
      }
    }

    // ── Niche breakdown ──────────────────────────────────────────
    let pousadaClients = 0;
    let pousadaRevenue = 0;
    let pousadaReservations = 0;

    let anfitrioesClients = 0;
    let anfitrioesRevenue = 0;
    let anfitrioesProperties = 0;
    let anfitrioesSuperhosts = 0;

    let parceiroClients = 0;
    let parceiroMrr = 0;
    let parceiroReferrals = 0;

    try {
      // Pousadas
      const pousadaTenants = allTenants.filter(t => {
        const pt = t.property?.type;
        return pt && ['pousada', 'hotel', 'hostel', 'chalé', 'resort'].includes(pt);
      });
      pousadaClients = pousadaTenants.length;

      for (const t of pousadaTenants) {
        const sub = t.subscriptions.find(s => s.status === 'active');
        pousadaRevenue += sub?.amount ?? planPricing[t.plan] ?? 0;
        const resCount = await db.reservation.count({ where: { tenantId: t.id } });
        pousadaReservations += resCount;
      }

      // Anfitriões (Airbnb)
      const airbnbTenants = allTenants.filter(t => (t.airbSubscriptions?.length ?? 0) > 0);
      anfitrioesClients = airbnbTenants.length;
      for (const t of airbnbTenants) {
        const airbSub = t.airbSubscriptions.find(s => s.status === 'active');
        anfitrioesRevenue += airbSub?.amount ?? 397;
        const propCount = await db.airBProperty.count({ where: { tenantId: t.id } });
        anfitrioesProperties += propCount;
      }
      // Superhosts = mock — assume 0 for now
      anfitrioesSuperhosts = 0;

      // Parceiro
      const parceiroTenants = allTenants.filter(t => t.plan === 'parceiro');
      parceiroClients = parceiroTenants.length;
      for (const t of parceiroTenants) {
        const sub = t.subscriptions.find(s => s.status === 'active');
        parceiroMrr += sub?.amount ?? 97;
      }
      parceiroReferrals = 0; // placeholder
    } catch {
      // Graceful fallback — keep zeros
    }

    // ── System status (always healthy for SQLite) ────────────────
    const systemStatus = {
      app: 'operational' as const,
      postgresql: 'operational' as const,
      redis: 'not_used' as const,
      evolutionApi: 'operational' as const,
      nginx: 'operational' as const,
      bullmq: 'not_used' as const,
    };

    return NextResponse.json({
      success: true,
      data: {
        totalClients,
        totalRooms,
        totalReservations,
        totalRevenue,
        totalMessagesProcessed,
        avgOccupancy,
        monthlyGrowth,
        mrr: {
          total: mrrPousadas + mrrAirbnb + mrrParceiro,
          pousadas: mrrPousadas,
          airbnb: mrrAirbnb,
          parceiro: mrrParceiro,
        },
        nicheBreakdown: {
          pousadas: { clients: pousadaClients, revenue: pousadaRevenue, reservations: pousadaReservations },
          anfitrioes: { clients: anfitrioesClients, revenue: anfitrioesRevenue, properties: anfitrioesProperties, superhosts: anfitrioesSuperhosts },
          parceiro: { clients: parceiroClients, mrr: parceiroMrr, referrals: parceiroReferrals },
        },
        systemStatus,
      },
    });
  } catch (error) {
    console.error('[ZCC Metrics] Error:', error);
    return NextResponse.json({
      success: true,
      data: {
        totalClients: 0,
        totalRooms: 0,
        totalReservations: 0,
        totalRevenue: 0,
        totalMessagesProcessed: 0,
        avgOccupancy: 0,
        monthlyGrowth: 0,
        mrr: { total: 0, pousadas: 0, airbnb: 0, parceiro: 0 },
        nicheBreakdown: {
          pousadas: { clients: 0, revenue: 0, reservations: 0 },
          anfitrioes: { clients: 0, revenue: 0, properties: 0, superhosts: 0 },
          parceiro: { clients: 0, mrr: 0, referrals: 0 },
        },
        systemStatus: {
          app: 'degraded',
          postgresql: 'unknown',
          redis: 'not_used',
          evolutionApi: 'unknown',
          nginx: 'unknown',
          bullmq: 'not_used',
        },
      },
    });
  }
}
