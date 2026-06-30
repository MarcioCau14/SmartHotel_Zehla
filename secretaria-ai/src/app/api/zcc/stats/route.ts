import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const [totalLeads, verifiedLeads, activeCampaigns] = await Promise.all([
      db.lead.count(),
      db.lead.count({ where: { status: { in: ['verified', 'contacted', 'converted'] } } }),
      db.campaign.count({ where: { status: 'active' } }),
    ]);

    const convertedLeads = await db.lead.count({ where: { status: 'converted' } });
    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';

    return NextResponse.json({
      totalLeads,
      verifiedLeads,
      messagesSent: verifiedLeads * 4,
      activeCampaigns,
      conversionRate,
      monthlyAICost: 47.50,
    });
  } catch (error) {
    console.error('[ZCC Stats]', error);
    return NextResponse.json(
      { totalLeads: 0, verifiedLeads: 0, messagesSent: 0, activeCampaigns: 0, conversionRate: '0.0', monthlyAICost: 0 },
      { status: 500 }
    );
  }
}
