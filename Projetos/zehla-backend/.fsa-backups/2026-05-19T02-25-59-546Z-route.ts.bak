import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Rate limiting simples (em memória — em produção usar Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = 100 // requests per minute
const RATE_WINDOW = 60 * 1000 // 1 minute

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'CHECK_RATE_LIMIT':
        return await checkRateLimit(data.ip, data.endpoint)
      case 'LOG_SECURITY_EVENT':
        return await logSecurityEvent(data)
      case 'GET_THREATS':
        return await getThreats(data)
      case 'BLOCK_IP':
        return await blockIp(data.ip, data.reason)
      default:
        return NextResponse.json({ success: false, error: 'Ação inválida' }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Erro em Guardian:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}

async function checkRateLimit(ip: string, endpoint: string) {
  const now = Date.now()
  const key = `${ip}:${endpoint}`
  const record = requestCounts.get(key)

  if (!record || now > record.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + RATE_WINDOW })
    return NextResponse.json({ success: true, allowed: true, remaining: RATE_LIMIT - 1 })
  }

  if (record.count >= RATE_LIMIT) {
    await logSecurityEvent({
      level: 'WARNING',
      component: 'GUARDIAN',
      message: `Rate limit exceeded for IP ${ip} on ${endpoint}`,
      metadata: JSON.stringify({ ip, endpoint, count: record.count })
    })
    return NextResponse.json({ success: false, allowed: false, error: 'Rate limit exceeded' }, { status: 429 })
  }

  record.count++
  return NextResponse.json({ success: true, allowed: true, remaining: RATE_LIMIT - record.count })
}

async function logSecurityEvent(data: any) {
  const log = await prisma.systemLog.create({
    data: {
      level: data.level || 'INFO',
      component: data.component || 'GUARDIAN',
      message: data.message,
      metadata: data.metadata
    }
  })

  return NextResponse.json({ success: true, data: log })
}

async function getThreats(filters: any) {
  const where: any = { component: 'GUARDIAN' }

  if (filters?.level) where.level = filters.level
  if (filters?.startDate) where.createdAt = { gte: new Date(filters.startDate) }

  const threats = await prisma.systemLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: filters?.limit || 100
  })

  const summary = {
    total: threats.length,
    critical: threats.filter(t => t.level === 'CRITICAL').length,
    warnings: threats.filter(t => t.level === 'WARNING').length,
    threats
  }

  return NextResponse.json({ success: true, data: summary })
}

async function blockIp(ip: string, reason: string) {
  // Em produção, isso atualizaria firewall/iptables
  const log = await prisma.systemLog.create({
    data: {
      level: 'CRITICAL',
      component: 'GUARDIAN',
      message: `IP blocked: ${ip}`,
      metadata: JSON.stringify({ ip, reason, action: 'BLOCK_IP', timestamp: new Date() })
    }
  })

  return NextResponse.json({ success: true, data: log, message: `IP ${ip} bloqueado` })
}

export async function GET() {
  return NextResponse.json({
    agent: 'GUARDIAN',
    status: 'online',
    description: 'Segurança, rate limiting e anti-fraude',
    config: {
      rateLimit: RATE_LIMIT,
      rateWindow: '1 minute'
    }
  })
}
