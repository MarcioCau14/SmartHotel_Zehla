import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'ANALYZE_PATTERNS':
        return await analyzePatterns(data)
      case 'GET_INSIGHTS':
        return await getInsights(data)
      case 'TRAIN_FROM_FEEDBACK':
        return await trainFromFeedback(data)
      case 'GET_PERFORMANCE':
        return await getPerformance(data)
      default:
        return NextResponse.json({ success: false, error: 'Ação inválida' }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Erro em Learner:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

async function analyzePatterns(data: any) {
  const { propertyId, period } = data
  const startDate = period?.startDate ? new Date(period.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const endDate = period?.endDate ? new Date(period.endDate) : new Date()

  // Buscar logs dos agentes
  const logs = await prisma.agentLog.findMany({
    where: {
      propertyId,
      createdAt: { gte: startDate, lte: endDate }
    },
    orderBy: { createdAt: 'asc' }
  })

  // Analisar padrões
  const patterns = {
    totalInteractions: logs.length,
    byAgent: logs.reduce((acc: any, log) => {
      acc[log.agentName] = (acc[log.agentName] || 0) + 1
      return acc
    }, {}),
    byIntent: logs.reduce((acc: any, log) => {
      const intentKey = log.intent || 'unknown'
      acc[intentKey] = (acc[intentKey] || 0) + 1
      return acc
    }, {}),
    averageConfidence: logs.length > 0 
      ? logs.reduce((sum, log) => sum + (log.confidence || 0), 0) / logs.length 
      : 0,
    averageResponseTime: logs.length > 0
      ? logs.reduce((sum, log) => sum + log.duration, 0) / logs.length
      : 0,
    fallbackRate: logs.length > 0
      ? logs.filter(l => l.status === 'FALLBACK').length / logs.length
      : 0,
    errorRate: logs.length > 0
      ? logs.filter(l => l.status === 'ERROR').length / logs.length
      : 0,
    peakHours: analyzePeakHours(logs),
    commonQuestions: getCommonQuestions(logs)
  }

  return NextResponse.json({ success: true, data: patterns })
}

async function getInsights(data: any) {
  const { propertyId } = data

  const reservations = await prisma.reservation.findMany({
    where: { propertyId, status: { in: ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'] } },
    include: { room: true }
  })

  const insights = {
    revenue: {
      total: reservations.reduce((sum, r) => sum + r.totalAmount, 0),
      averagePerReservation: reservations.length > 0 
        ? reservations.reduce((sum, r) => sum + r.totalAmount, 0) / reservations.length 
        : 0
    },
    occupancy: {
      totalNights: reservations.reduce((sum, r) => sum + r.nights, 0),
      averageNights: reservations.length > 0
        ? reservations.reduce((sum, r) => sum + r.nights, 0) / reservations.length
        : 0
    },
    guests: {
      totalGuests: reservations.reduce((sum, r) => sum + r.guestCount, 0),
      averageGuests: reservations.length > 0
        ? reservations.reduce((sum, r) => sum + r.guestCount, 0) / reservations.length
        : 0
    },
    recommendations: generateRecommendations(reservations)
  }

  return NextResponse.json({ success: true, data: insights })
}

async function trainFromFeedback(data: any) {
  const { logId, feedback, correctedIntent } = data

  const log = await prisma.agentLog.update({
    where: { id: logId },
    data: {
      // Armazenar feedback para treinamento futuro
      // Em produção, isso alimentaria um pipeline de RLHF
    }
  })

  // Criar registro de treinamento
  const trainingRecord = await prisma.systemLog.create({
    data: {
      level: 'INFO',
      component: 'LEARNER',
      message: `Feedback recebido para log ${logId}`,
      metadata: JSON.stringify({
        logId,
        feedback,
        correctedIntent,
        originalIntent: log.intent,
        timestamp: new Date()
      })
    }
  })

  return NextResponse.json({
    success: true,
    data: {
      message: 'Feedback registrado para treinamento',
      trainingRecord
    }
  })
}

async function getPerformance(data: any) {
  const { propertyId, agentName } = data

  const logs = await prisma.agentLog.findMany({
    where: {
      propertyId,
      ...(agentName ? { agentName } : {})
    },
    orderBy: { createdAt: 'desc' },
    take: 1000
  })

  const performance = {
    agent: agentName || 'ALL',
    totalCalls: logs.length,
    successRate: logs.length > 0 ? logs.filter(l => l.status === 'SUCCESS').length / logs.length : 0,
    averageResponseTime: logs.length > 0 ? logs.reduce((sum, l) => sum + l.duration, 0) / logs.length : 0,
    averageConfidence: logs.length > 0 ? logs.reduce((sum, l) => sum + (l.confidence || 0), 0) / logs.length : 0,
    totalCost: logs.reduce((sum, l) => sum + l.cost, 0),
    totalTokens: logs.reduce((sum, l) => sum + l.tokensUsed, 0),
    trends: calculateTrends(logs)
  }

  return NextResponse.json({ success: true, data: performance })
}

// Helpers
function analyzePeakHours(logs: any[]) {
  const hours = new Array(24).fill(0)
  logs.forEach(log => {
    const hour = new Date(log.createdAt).getHours()
    hours[hour]++
  })

  const peakHour = hours.indexOf(Math.max(...hours))
  return {
    peakHour: `${peakHour}:00`,
    peakVolume: hours[peakHour],
    hourlyDistribution: hours
  }
}

function getCommonQuestions(logs: any[]) {
  const intents = logs.reduce((acc: any, log) => {
    acc[log.intent] = (acc[log.intent] || 0) + 1
    return acc
  }, {})

  return Object.entries(intents)
    .sort(([, a]: [string, any], [, b]: [string, any]) => b - a)
    .slice(0, 5)
    .map(([intent, count]) => ({ intent, count }))
}

function generateRecommendations(reservations: any[]) {
  const recommendations = []

  if (reservations.length === 0) {
    recommendations.push('Ainda não há dados suficientes. Continue operando para gerar insights.')
    return recommendations
  }

  const avgNights = reservations.reduce((sum, r) => sum + r.nights, 0) / reservations.length
  if (avgNights < 3) {
    recommendations.push('Considere oferecer pacotes de 3+ noites para aumentar o ticket médio.')
  }

  const sources = reservations.reduce((acc: any, r) => {
    acc[r.source] = (acc[r.source] || 0) + 1
    return acc
  }, {})

  if ((sources['WHATSAPP'] || 0) > (sources['DIRECT'] || 0)) {
    recommendations.push('WhatsApp é sua principal fonte de reservas. Invista em respostas rápidas.')
  }

  return recommendations
}

function calculateTrends(logs: any[]) {
  if (logs.length < 10) return { message: 'Dados insuficientes para tendências' }

  const midPoint = Math.floor(logs.length / 2)
  const firstHalf = logs.slice(0, midPoint)
  const secondHalf = logs.slice(midPoint)

  return {
    responseTimeTrend: {
      firstHalf: firstHalf.reduce((sum, l) => sum + l.duration, 0) / firstHalf.length,
      secondHalf: secondHalf.reduce((sum, l) => sum + l.duration, 0) / secondHalf.length,
      improving: secondHalf.reduce((sum, l) => sum + l.duration, 0) / secondHalf.length < firstHalf.reduce((sum, l) => sum + l.duration, 0) / firstHalf.length
    },
    confidenceTrend: {
      firstHalf: firstHalf.reduce((sum, l) => sum + (l.confidence || 0), 0) / firstHalf.length,
      secondHalf: secondHalf.reduce((sum, l) => sum + (l.confidence || 0), 0) / secondHalf.length,
      improving: secondHalf.reduce((sum, l) => sum + (l.confidence || 0), 0) / secondHalf.length > firstHalf.reduce((sum, l) => sum + (l.confidence || 0), 0) / firstHalf.length
    }
  }
}

export async function GET() {
  return NextResponse.json({
    agent: 'LEARNER',
    status: 'online',
    description: 'Cross-agent learning, Fleet ML e análise de padrões'
  })
}
