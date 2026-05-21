import { prisma } from '@/lib/prisma';
import { LeadStatus } from '@prisma/client';

export interface TelemetryMetrics {
  leadConversionRate: number;
  avgResponseTimeMs: number;
  bookingSuccessRate: number;
  agentCloseRate: number;
  abandonmentCount: number;
}

type ConversationMessages = {
  phone: string;
  direction: string;
  createdAt: Date;
};

type AgentLogEntry = {
  propertyId: string;
  intent: string;
  status: string;
};

export class TelemetryEngine {
  /**
   * Calculates metrics for ALL properties in a single batch.
   * Returns a Map<propertyId, TelemetryMetrics>
   */
  static async calculateAllMetrics(
    propertyIds: string[],
    startDate: Date,
    endDate: Date
  ): Promise<Map<string, TelemetryMetrics>> {
    const metricsMap = new Map<string, TelemetryMetrics>();

    if (propertyIds.length === 0) return metricsMap;

    const [
      leadCounts,
      convertedCounts,
      allMessages,
      allAgentLogs,
      reservationCounts
    ] = await Promise.all([
      // Batched: total leads per property
      prisma.lead.groupBy({
        by: ['propertyId'],
        where: { propertyId: { in: propertyIds }, createdAt: { gte: startDate, lte: endDate } },
        _count: { id: true }
      }),
      // Batched: converted leads per property
      prisma.lead.groupBy({
        by: ['propertyId'],
        where: { propertyId: { in: propertyIds }, status: LeadStatus.CONVERTED, updatedAt: { gte: startDate, lte: endDate } },
        _count: { id: true }
      }),
      // Batched: all messages for all properties
      prisma.message.findMany({
        where: { propertyId: { in: propertyIds }, createdAt: { gte: startDate, lte: endDate } },
        orderBy: { createdAt: 'asc' },
        select: { propertyId: true, phone: true, direction: true, createdAt: true }
      }),
      // Batched: all agent logs for all properties
      prisma.agentLog.findMany({
        where: { propertyId: { in: propertyIds }, createdAt: { gte: startDate, lte: endDate } },
        select: { propertyId: true, intent: true, status: true }
      }),
      // Batched: reservation counts per property
      prisma.reservation.groupBy({
        by: ['propertyId'],
        where: { propertyId: { in: propertyIds }, source: 'WHATSAPP', createdAt: { gte: startDate, lte: endDate } },
        _count: { id: true }
      })
    ]);

    const leadCountMap = new Map(leadCounts.map(l => [l.propertyId, l._count.id]));
    const convertedMap = new Map(convertedCounts.map(l => [l.propertyId, l._count.id]));
    const reservationMap = new Map(reservationCounts.map(r => [r.propertyId, r._count.id]));

    const messagesByProp = new Map<string, ConversationMessages[]>();
    for (const msg of allMessages) {
      if (!messagesByProp.has(msg.propertyId)) messagesByProp.set(msg.propertyId, []);
      const arr = messagesByProp.get(msg.propertyId)!;
      arr.push({ phone: msg.phone, direction: msg.direction, createdAt: msg.createdAt });
    }

    const agentLogsByProp = new Map<string, AgentLogEntry[]>();
    for (const log of allAgentLogs) {
      if (!agentLogsByProp.has(log.propertyId)) agentLogsByProp.set(log.propertyId, []);
      const arr = agentLogsByProp.get(log.propertyId)!;
      arr.push({ propertyId: log.propertyId, intent: log.intent, status: log.status });
    }

    for (const propertyId of propertyIds) {
      const totalLeads = leadCountMap.get(propertyId) ?? 0;
      const convertedLeads = convertedMap.get(propertyId) ?? 0;
      const messages = messagesByProp.get(propertyId) ?? [];
      const agentLogs = agentLogsByProp.get(propertyId) ?? [];
      const reservations = reservationMap.get(propertyId) ?? 0;

      const leadConversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      let totalResponseTime = 0;
      let responseCount = 0;

      const conversations = new Map<string, ConversationMessages[]>();
      messages.forEach(msg => {
        if (!conversations.has(msg.phone)) conversations.set(msg.phone, []);
        conversations.get(msg.phone)?.push(msg);
      });

      conversations.forEach(msgs => {
        for (let i = 0; i < msgs.length - 1; i++) {
          if (msgs[i].direction === 'INBOUND' && msgs[i + 1].direction === 'OUTBOUND') {
            const delta = msgs[i + 1].createdAt.getTime() - msgs[i].createdAt.getTime();
            if (delta < 24 * 60 * 60 * 1000) {
              totalResponseTime += delta;
              responseCount++;
            }
          }
        }
      });

      const avgResponseTimeMs = responseCount > 0 ? totalResponseTime / responseCount : 0;

      const closingLogs = agentLogs.filter(log => log.intent === 'CLOSING');
      const successfulClosings = closingLogs.filter(log => log.status === 'SUCCESS').length;
      const agentCloseRate = closingLogs.length > 0 ? (successfulClosings / closingLogs.length) * 100 : 0;

      const interestedLeads = agentLogs.filter(log => log.intent === 'BOOKING_INTEREST').length;
      const bookingSuccessRate = interestedLeads > 0 ? (reservations / interestedLeads) * 100 : 0;

      const abandonmentCount = Array.from(conversations.values()).filter(msgs => {
        const lastMsg = msgs[msgs.length - 1];
        return lastMsg.direction === 'INBOUND' && (Date.now() - lastMsg.createdAt.getTime() > 4 * 60 * 60 * 1000);
      }).length;

      metricsMap.set(propertyId, {
        leadConversionRate,
        avgResponseTimeMs,
        bookingSuccessRate,
        agentCloseRate,
        abandonmentCount
      });
    }

    return metricsMap;
  }

  /**
   * Persists calculated metrics to the database
   */
  static async saveTelemetry(propertyId: string, metrics: TelemetryMetrics) {
    const hourStart = new Date();
    hourStart.setMinutes(0, 0, 0);

    return prisma.businessTelemetry.upsert({
      where: {
        propertyId_date: {
          propertyId,
          date: hourStart
        }
      },
      update: metrics,
      create: {
        propertyId,
        date: hourStart,
        ...metrics
      }
    });
  }

  static async saveAllTelemetry(metricsMap: Map<string, TelemetryMetrics>) {
    const operations: Promise<any>[] = [];
    metricsMap.forEach((metrics, propertyId) => {
      operations.push(this.saveTelemetry(propertyId, metrics));
    });
    await Promise.all(operations);
  }
}
