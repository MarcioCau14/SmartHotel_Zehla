/**
 * ZEHLA DDC — Auth & Tenant Resolution & Prisma to DDC Interface Mappers
 * 
 * Centralizes translation between database models and frontend types.
 */

import { resolveTenantId } from './auth-utils';
import type {
  Guest,
  Booking,
  ConversationLog,
  ConversationMessage,
  Notification,
  TrainingPrompt,
} from '@/types/ddc';

export { resolveTenantId };

export function mapGuest(g: any): Guest {
  return {
    id: g.id,
    name: g.name,
    phoneNumber: g.phone,
    email: g.email || undefined,
    status: g.status === 'new' || g.status === 'inactive' ? 'cold' as const
      : g.status === 'booked' || g.status === 'staying' || g.status === 'checked_out' ? 'closed' as const
      : (g.status as 'hot' | 'warm' | 'cold' | 'closed' | 'lost'),
    score: g.aiScore,
    propertyId: g.tenantId,
    lastMessage: g.notes || undefined,
    messageCount: g.conversationCount,
    value: g.value,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
  };
}

export function mapBooking(b: any): Booking {
  return {
    id: b.id,
    guestId: b.guestId,
    roomId: b.roomName || undefined,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    total: b.totalValue,
    status: b.status === 'checked_in' || b.status === 'checked_out' ? 'completed' as const : b.status as 'pending' | 'confirmed' | 'cancelled' | 'completed',
    paymentStatus: b.paymentStatus === 'paid' ? 'paid' as const : b.paymentStatus === 'refunded' ? 'refunded' as const : 'pending' as const,
    propertyId: b.tenantId,
    guest: b.guest ? { id: b.guest.id, name: b.guest.name, phone: b.guest.phone } : undefined,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  };
}

function mapConversationStatus(s: string): 'in_progress' | 'escalated' | 'closed' {
  if (s === 'active') return 'in_progress';
  if (s === 'escalated') return 'escalated';
  return 'closed';
}

function mapConversationMessage(m: any): ConversationMessage {
  return {
    id: m.id,
    conversationId: m.conversationId,
    role: m.from === 'guest' ? 'user' as const : m.from === 'ai' ? 'assistant' as const : 'system' as const,
    content: m.content,
    confidence: undefined,
    metadata: {},
    createdAt: m.timestamp,
  };
}

export function mapConversation(c: any): ConversationLog {
  return {
    id: c.id,
    guestId: c.guestId,
    guestName: c.guestName,
    phoneNumber: c.guestPhone,
    status: mapConversationStatus(c.status),
    aiScore: c.aiConfidence,
    needsEscalation: c.status === 'escalated',
    metadata: {},
    messages: (c.messages || []).map(mapConversationMessage),
    propertyId: c.tenantId,
    createdAt: c.createdAt,
    updatedAt: c.lastUpdate,
  };
}

export function mapNotification(n: any): Notification {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    message: n.message,
    status: n.read ? 'read' as const : 'unread' as const,
    priority: n.priority as 'low' | 'normal' | 'high' | 'urgent',
    userId: n.tenantId,
    propertyId: n.tenantId,
    readAt: n.read ? n.createdAt : undefined,
    actionUrl: n.actionUrl || undefined,
    actionLabel: n.actionLabel || undefined,
    createdAt: n.createdAt,
  };
}

export function mapTraining(t: any): TrainingPrompt {
  return {
    id: t.id,
    title: t.name,
    content: t.content,
    category: t.type,
    version: 1,
    isActive: t.isActive,
    testResult: t.successRate > 0 ? { status: t.successRate >= 85 ? 'passed' as const : 'failed' as const, score: t.successRate } : undefined,
    propertyId: t.tenantId,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  };
}

export function adaptRevenueMetrics(apiMetrics: any): any {
  if (!apiMetrics) return null;

  return {
    today: {
      generated: apiMetrics.revenue || 0,
      reservations: apiMetrics.bookingsClosed || 0,
      aiAttended: apiMetrics.attendedToday || 0,
      conversionRate: apiMetrics.conversion || 0
    },
    week: {
      generated: (apiMetrics.revenue || 0) * 4.5,
      reservations: (apiMetrics.bookingsClosed || 0) * 5,
      growth: apiMetrics.revenueChange || 0
    },
    month: {
      generated: (apiMetrics.revenue || 0) * 18,
      reservations: (apiMetrics.bookingsClosed || 0) * 20,
      growth: apiMetrics.revenueChange || 0,
      projected: (apiMetrics.revenue || 0) * 25
    }
  };
}
