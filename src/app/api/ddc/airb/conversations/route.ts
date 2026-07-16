import { NextResponse } from 'next/server';
import { db, isDatabaseAvailable } from '@/lib/db';
import { resolveTenantId } from '@/lib/ddc/auth-utils';

const demoConversations = [
  {
    id: 'demo-airb-conv-1',
    tenantId: 'demo',
    propertyId: 'demo-airb-1',
    guestName: 'Maria Silva',
    guestPhone: '5511977665544',
    status: 'active',
    lastMessage: 'Olá, qual o horário de check-in?',
    lastMessageAt: new Date(Date.now() - 1800000).toISOString(),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
    property: { name: 'Apartamento Vista Mar - Jurerê Internacional' },
  },
  {
    id: 'demo-airb-conv-2',
    tenantId: 'demo',
    propertyId: 'demo-airb-1',
    guestName: 'João Santos',
    guestPhone: '5521966554433',
    status: 'active',
    lastMessage: 'O Wi-Fi é rápido? Preciso trabalhar durante a estadia.',
    lastMessageAt: new Date(Date.now() - 7200000).toISOString(),
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    property: { name: 'Apartamento Vista Mar - Jurerê Internacional' },
  },
  {
    id: 'demo-airb-conv-3',
    tenantId: 'demo',
    propertyId: 'demo-airb-2',
    guestName: 'Ana Costa',
    guestPhone: '5531955443322',
    status: 'resolved',
    lastMessage: 'Perfeito, confirmado para sexta!',
    lastMessageAt: new Date(Date.now() - 14400000).toISOString(),
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
    property: { name: 'Studio Moderno - Copacabana' },
  },
  {
    id: 'demo-airb-conv-4',
    tenantId: 'demo',
    propertyId: 'demo-airb-3',
    guestName: 'Carlos Mendes',
    guestPhone: '5541988776655',
    status: 'active',
    lastMessage: 'A piscina é aquecida? Minha filha adora nadar!',
    lastMessageAt: new Date(Date.now() - 28800000).toISOString(),
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    updatedAt: new Date(Date.now() - 28800000).toISOString(),
    property: { name: 'Casa com Piscina - Campos do Jordão' },
  },
];

// GET /api/ddc/airb/conversations — List all Airbnb conversations for tenant
export async function GET() {
  try {
    const dbAvailable = await isDatabaseAvailable();
    if (!dbAvailable) {
      return NextResponse.json({ success: true, data: demoConversations });
    }

    const tenantId = await resolveTenantId();
    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await db.airBConversation.findMany({
      where: { tenantId },
      include: { property: { select: { name: true } } },
      orderBy: { lastMessageAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: conversations });
  } catch (error) {
    console.error('[AIRB] Error listing conversations:', error);
    return NextResponse.json({ success: false, error: 'Failed to list conversations' }, { status: 500 });
  }
}
