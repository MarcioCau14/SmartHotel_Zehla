// =============================================================================
// API — Dashboard Stats
// =============================================================================
// GET /api/dashboard — Retorna estatísticas do dashboard
// =============================================================================

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PLAN_CONFIG, formatPrice, type PlanSlug } from '@/lib/features';

export async function GET() {
  try {
    // Get the first active tenant (demo mode)
    const tenant = await db.tenant.findFirst({
      where: { isActive: true },
      include: { plan: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Get property stats
    const [
      totalProperties,
      completeProperties,
      pendingProperties,
      totalConversations,
      activeConversations,
      preBookingConversations,
      postBookingConversations,
      totalMessages,
      aiMessages,
      recentConversations,
    ] = await Promise.all([
      db.airBProperty.count({ where: { tenantId: tenant.id, isActive: true } }),
      db.airBProperty.count({ where: { tenantId: tenant.id, isActive: true, scrapingStatus: 'complete' } }),
      db.airBProperty.count({ where: { tenantId: tenant.id, isActive: true, scrapingStatus: 'pending' } }),
      db.conversation.count({ where: { tenantId: tenant.id } }),
      db.conversation.count({ where: { tenantId: tenant.id, status: 'active' } }),
      db.conversation.count({ where: { tenantId: tenant.id, conversationMode: 'pre_booking' } }),
      db.conversation.count({ where: { tenantId: tenant.id, conversationMode: 'post_booking' } }),
      db.message.count({
        where: {
          conversation: { tenantId: tenant.id },
        },
      }),
      db.message.count({
        where: {
          conversation: { tenantId: tenant.id },
          isAiGenerated: true,
        },
      }),
      db.conversation.findMany({
        where: { tenantId: tenant.id },
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          property: { select: { name: true, city: true } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
    ]);

    // Calculate estimated costs
    const avgMessagesPerConversation = totalConversations > 0 ? totalMessages / totalConversations : 0;
    const estimatedWhatsappCost = totalMessages * 0.035; // R$0.035 per message
    const estimatedLLMCost = aiMessages * 0.005; // Rough estimate

    // Plan info
    const planConfig = PLAN_CONFIG[tenant.planSlug as PlanSlug];
    const planInfo = planConfig ? {
      slug: planConfig.slug,
      name: planConfig.name,
      priceFormatted: formatPrice(planConfig.priceCents),
      maxProperties: planConfig.maxProperties,
      currentProperties: totalProperties,
      usagePercent: Math.round((totalProperties / planConfig.maxProperties) * 100),
    } : null;

    return NextResponse.json({
      tenant: {
        id: tenant.id,
        name: tenant.name,
        mode: tenant.mode,
        onboardingComplete: tenant.onboardingComplete,
      },
      plan: planInfo,
      properties: {
        total: totalProperties,
        complete: completeProperties,
        pending: pendingProperties,
      },
      conversations: {
        total: totalConversations,
        active: activeConversations,
        preBooking: preBookingConversations,
        postBooking: postBookingConversations,
        avgMessagesPerConversation: Math.round(avgMessagesPerConversation * 10) / 10,
      },
      messages: {
        total: totalMessages,
        aiGenerated: aiMessages,
        humanGenerated: totalMessages - aiMessages,
      },
      costs: {
        estimatedWhatsappCost: Math.round(estimatedWhatsappCost * 100) / 100,
        estimatedLLMCost: Math.round(estimatedLLMCost * 100) / 100,
        totalEstimated: Math.round((estimatedWhatsappCost + estimatedLLMCost) * 100) / 100,
      },
      recentConversations: recentConversations.map(c => ({
        id: c.id,
        guestName: c.guestName,
        guestPhone: c.guestPhone,
        mode: c.conversationMode,
        status: c.status,
        property: c.property?.name ?? 'Sem imóvel',
        lastMessage: c.messages[0]?.content?.substring(0, 80) ?? '',
        updatedAt: c.updatedAt,
      })),
    });
  } catch (error) {
    console.error('[api/dashboard] GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
