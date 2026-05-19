import { LeadStatus } from '@prisma/client';

import { prisma } from '@/lib/prisma';


export interface TelemetryMetrics {
  leadConversionRate: number;
  avgResponseTimeMs: number;
  bookingSuccessRate: number;
  agentCloseRate: number;
  abandonmentCount: number;
}

export class TelemetryEngine {
  /**
   * Calculates metrics for a specific property within a date range
   */
  static async calculateMetrics(propertyId: string, startDate: Date, endDate: Date): Promise<TelemetryMetrics> {
    const [
      totalLeads,
      convertedLeads,
      messages,
      agentLogs,
      reservations
    ] = await Promise.all([
      // Total leads created in period
      prisma.lead.count({
        where: { propertyId, createdAt: { gte: startDate, lte: endDate } }
      }),
      // Leads converted in period
      prisma.lead.count({
        where: { propertyId, status: LeadStatus.CONVERTED, updatedAt: { gte: startDate, lte: endDate } }
      }),
      // Messages to calculate response time
      prisma.message.findMany({
        where: { propertyId, createdAt: { gte: startDate, lte: endDate } },
        orderBy: { createdAt: 'asc' },
        select: { phone: true, direction: true, createdAt: true }
      }),
      // Agent logs to calculate close rate (looking for CLOSING intent)
      prisma.agentLog.findMany({
        where: { propertyId, createdAt: { gte: startDate, lte: endDate } },
        select: { intent: true, status: true }
      }),
      // Reservations to check source
      prisma.reservation.count({
        where: { propertyId, source: 'WHATSAPP', createdAt: { gte: startDate, lte: endDate } }
      })
    ]);

    // 1. Lead Conversion Rate
    const leadConversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

    // 2. Average Response Time
    // Group messages by conversation (phone) and find the time between guest message and agent response
    let totalResponseTime = 0;
    let responseCount = 0;

    const conversations = new Map<string, any[]>();
    messages.forEach(msg => {
      if (!conversations.has(msg.phone)) conversations.set(msg.phone, []);
      conversations.get(msg.phone)?.push(msg);
    });

    conversations.forEach(msgs => {
      for (let i = 0; i < msgs.length - 1; i++) {
        if (msgs[i].direction === 'INBOUND' && msgs[i+1].direction === 'OUTBOUND') {
          const delta = msgs[i+1].createdAt.getTime() - msgs[i].createdAt.getTime();
          // Filter out outliers (e.g. responses after 24h)
          if (delta < 24 * 60 * 60 * 1000) {
            totalResponseTime += delta;
            responseCount++;
          }
        }
      }
    });

    const avgResponseTimeMs = responseCount > 0 ? totalResponseTime / responseCount : 0;

    // 3. Agent Close Rate (Successful 'CLOSING' intents)
    const closingLogs = agentLogs.filter(log => log.intent === 'CLOSING');
    const successfulClosings = closingLogs.filter(log => log.status === 'SUCCESS').length;
    const agentCloseRate = closingLogs.length > 0 ? (successfulClosings / closingLogs.length) * 100 : 0;

    // 4. Booking Success Rate
    // Simplified: Reservations from WhatsApp / Leads with interest
    const interestedLeads = agentLogs.filter(log => log.intent === 'BOOKING_INTEREST').length;
    const bookingSuccessRate = interestedLeads > 0 ? (reservations / interestedLeads) * 100 : 0;

    // 5. Abandonment Count (Heuristic: messages without final closing or response)
    const abandonmentCount = Array.from(conversations.values()).filter(msgs => {
      const lastMsg = msgs[msgs.length - 1];
      return lastMsg.direction === 'INBOUND' && (Date.now() - lastMsg.createdAt.getTime() > 4 * 60 * 60 * 1000);
    }).length;

    return {
      leadConversionRate,
      avgResponseTimeMs,
      bookingSuccessRate,
      agentCloseRate,
      abandonmentCount
    };
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
}
