import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyZCCAccessOrReject } from '@/lib/zcc-security';

const COST_PER_MESSAGE_USD = 0.0068;
const COST_PER_MESSAGE_BRL = 0.035;

export async function GET(request: NextRequest) {
  // ── Security Gate V3 — 6-Layer Protection ──
  const security = await verifyZCCAccessOrReject(request);
  if (!security.allowed) return security.response!;

  try {
    // ── Fetch all WhatsApp message costs ─────────────────────────
    let messageCosts: { tenantId: string; createdAt: Date; costUsd: number }[] = [];
    try {
      messageCosts = await db.whatsAppMessageCost.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch {
      messageCosts = [];
    }

    // ── Fetch tenants with plan info ─────────────────────────────
    const tenants = await db.tenant.findMany({
      select: {
        id: true,
        name: true,
        plan: true,
        status: true,
        property: { select: { type: true } },
        airbSubscriptions: {
          where: { status: 'active' },
          select: { amount: true, status: true },
        },
        subscriptions: {
          where: { status: 'active' },
          select: { amount: true, status: true },
        },
      },
    });

    // ── Calculate per-tenant costs ───────────────────────────────
    const PLAN_PRICING: Record<string, number> = {
      trial: 0,
      starter: 147,
      pro: 297,
      business: 597,
      parceiro: 97,
    };

    const oneWeekAgo = new Date(Date.now() - 7 * 86400000);
    const oneMonthAgo = new Date(Date.now() - 30 * 86400000);

    const tenantCosts = tenants.map((tenant) => {
      const tenantMessages = messageCosts.filter(m => m.tenantId === tenant.id);
      const weekMessages = tenantMessages.filter(m => new Date(m.createdAt) >= oneWeekAgo);
      const monthMessages = tenantMessages.filter(m => new Date(m.createdAt) >= oneMonthAgo);

      const messagesWeek = weekMessages.length;
      const messagesMonth = monthMessages.length;
      const whatsappCostWeek = messagesWeek * COST_PER_MESSAGE_USD;
      const whatsappCostMonth = messagesMonth * COST_PER_MESSAGE_USD;

      // Determine monthly price
      let monthlyPrice = PLAN_PRICING[tenant.plan] ?? 0;
      const activeSub = tenant.subscriptions.find(s => s.status === 'active');
      if (activeSub) monthlyPrice = activeSub.amount;
      const airbSub = tenant.airbSubscriptions.find(s => s.status === 'active');
      if (airbSub) monthlyPrice = airbSub.amount;

      // Determine niche
      const propertyType = tenant.property?.type;
      let niche = 'pousadas';
      if (tenant.plan === 'parceiro') niche = 'parceiro';
      else if (propertyType === 'airbnb' || (tenant.airbSubscriptions?.length ?? 0) > 0) niche = 'anfitrioes';

      const costRatio = monthlyPrice > 0 ? whatsappCostMonth / monthlyPrice : 0;

      // Anomaly detection: cost ratio > 20% or more than 500 messages/week
      const anomaly = costRatio > 0.2 || messagesWeek > 500;

      // Trend: compare this week to previous week
      const twoWeeksAgo = new Date(Date.now() - 14 * 86400000);
      const prevWeekMessages = tenantMessages.filter(
        m => new Date(m.createdAt) >= twoWeeksAgo && new Date(m.createdAt) < oneWeekAgo
      ).length;
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (messagesWeek > prevWeekMessages * 1.1) trend = 'up';
      else if (messagesWeek < prevWeekMessages * 0.9) trend = 'down';

      return {
        id: tenant.id,
        name: tenant.name,
        niche,
        plan: tenant.plan,
        monthlyPrice,
        whatsappCostWeek: Math.round(whatsappCostWeek * 10000) / 10000,
        whatsappCostMonth: Math.round(whatsappCostMonth * 10000) / 10000,
        messagesWeek,
        messagesMonth,
        costRatio: Math.round(costRatio * 10000) / 10000,
        anomaly,
        trend,
      };
    });

    // ── Totals ───────────────────────────────────────────────────
    const totalMonthlyWhatsApp = tenantCosts.reduce((s, t) => s + t.whatsappCostMonth, 0);
    const totalMRR = tenantCosts.reduce((s, t) => s + t.monthlyPrice, 0);
    const overallRatio = totalMRR > 0 ? totalMonthlyWhatsApp / totalMRR : 0;

    // ── Breakdown by niche ───────────────────────────────────────
    const nicheGroups: Record<string, number> = {};
    for (const tc of tenantCosts) {
      nicheGroups[tc.niche] = (nicheGroups[tc.niche] || 0) + tc.whatsappCostMonth;
    }
    const breakdown = Object.entries(nicheGroups).map(([category, cost]) => ({
      category,
      cost: Math.round(cost * 10000) / 10000,
      percentage: totalMonthlyWhatsApp > 0 ? Math.round((cost / totalMonthlyWhatsApp) * 10000) / 100 : 0,
    }));

    return NextResponse.json({
      success: true,
      data: {
        totalMonthlyWhatsApp: Math.round(totalMonthlyWhatsApp * 10000) / 10000,
        totalMRR,
        overallRatio: Math.round(overallRatio * 10000) / 10000,
        tenantCosts,
        breakdown,
        metaTariff: {
          costPerMessageUsd: COST_PER_MESSAGE_USD,
          costPerMessageBrl: COST_PER_MESSAGE_BRL,
          effectiveDate: '2026-10-01',
        },
      },
    });
  } catch (error) {
    console.error('[ZCC Burn Rate] Error:', error);
    return NextResponse.json({
      success: true,
      data: {
        totalMonthlyWhatsApp: 0,
        totalMRR: 0,
        overallRatio: 0,
        tenantCosts: [],
        breakdown: [],
        metaTariff: {
          costPerMessageUsd: COST_PER_MESSAGE_USD,
          costPerMessageBrl: COST_PER_MESSAGE_BRL,
          effectiveDate: '2026-10-01',
        },
      },
    });
  }
}
