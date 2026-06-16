import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PousadaFinance } from '../../domain/financeiro/entities/PousadaFinance';
import { FinanceTransaction } from '../../domain/financeiro/entities/FinanceTransaction';
import { FinanceAlert } from '../../domain/financeiro/entities/FinanceAlert';
import { ObterDashboardFinanceiroUseCase } from '../../application/financeiro/use-cases/ObterDashboardFinanceiroUseCase';
import { EnviarPerguntaChatFinanceiroUseCase } from '../../application/financeiro/use-cases/EnviarPerguntaChatFinanceiroUseCase';
import { GET } from '../../app/api/zcc/finance/dashboard/route';
import { POST as ChatPOST } from '../../app/api/zcc/finance/chat/route';
import { prisma } from '@/lib/prisma';
import { llmRouter } from '@/lib/ai/llm-router';

// Mock do prisma
vi.mock('@/lib/prisma', () => {
  const mockProperty = {
    id: 'prop_sol_001',
    name: 'Pousada Solar',
    rooms: [
      { id: 'room_1', number: '101' },
      { id: 'room_2', number: '102' }
    ]
  };

  const mockFinances = [
    {
      id: 'fin_1',
      propertyId: 'prop_sol_001',
      scope: 'CLIENT',
      date: new Date(),
      grossRevenue: 1000.0,
      netRevenue: 980.0,
      channelBreakdown: { booking: 800, airbnb: 200 },
      totalRooms: 10,
      occupiedRooms: 2,
      occupancyRate: 20.0,
      adr: 500.0,
      revpar: 98.0,
      operatingCosts: { limpeza: 200 },
      totalCosts: 200.0,
      aiInsight: 'Insight de teste',
      healthScore: 80,
      alertLevel: 'green'
    }
  ];

  const mockAlerts = [
    {
      id: 'alert_1',
      propertyId: 'prop_sol_001',
      scope: 'CLIENT',
      type: 'low_occupancy',
      severity: 'WARNING',
      agentName: 'Jony',
      message: 'Ocupação do feriado está 20% abaixo do esperado',
      metric: {},
      isRead: false,
      createdAt: new Date(),
    }
  ];

  return {
    prisma: {
      property: {
        findUnique: vi.fn().mockResolvedValue(mockProperty),
      },
      pousadaFinance: {
        findFirst: vi.fn().mockResolvedValue(mockFinances[0]),
        findMany: vi.fn().mockResolvedValue(mockFinances),
        upsert: vi.fn().mockImplementation(({ create }) => Promise.resolve(create)),
      },
      financeTransaction: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      financeAlert: {
        findMany: vi.fn().mockResolvedValue(mockAlerts),
        update: vi.fn().mockResolvedValue({ id: 'alert_1', isRead: true }),
      },
      reservation: {
        findMany: vi.fn().mockResolvedValue([]),
      }
    }
  };
});

// Mock do llmRouter
vi.mock('@/lib/ai/llm-router', () => {
  return {
    llmRouter: {
      generate: vi.fn().mockResolvedValue({
        content: 'Este é um insight gerado pela IA para a pousada.',
        tokensUsed: 120,
        cost: 0.001
      })
    }
  };
});

describe('ZEHLA Finance Domain Entities', () => {
  it('should create and validate PousadaFinance domain entity successfully', () => {
    const result = PousadaFinance.create({
      id: 'fin_abc',
      propertyId: 'prop_abc',
      scope: 'CLIENT',
      date: new Date(),
      grossRevenue: 5000.0,
      netRevenue: 4900.0,
      channelBreakdown: { booking: 3000, direto: 2000 },
      totalRooms: 10,
      occupiedRooms: 5,
      adr: 1000.0,
      operatingCosts: { lavanderia: 500 },
      totalCosts: 500.0,
      aiInsight: null,
      healthScore: null,
      alertLevel: null,
    });

    expect(result.isOk).toBe(true);
    expect(result.value.occupancyRate).toBe(50.0);
    expect(result.value.revpar).toBe(490.0);
  });

  it('should fail creation of PousadaFinance if occupancy is greater than total rooms', () => {
    const result = PousadaFinance.create({
      id: 'fin_abc',
      propertyId: 'prop_abc',
      scope: 'CLIENT',
      date: new Date(),
      grossRevenue: 5000.0,
      netRevenue: 4900.0,
      channelBreakdown: null,
      totalRooms: 5,
      occupiedRooms: 10, // Fail
      adr: 500.0,
      operatingCosts: null,
      totalCosts: 0.0,
      aiInsight: null,
      healthScore: null,
      alertLevel: null,
    });

    expect(result.isFail).toBe(true);
    expect(result.error.message).toBe('OCUPACAO_MAIOR_QUE_TOTAL');
  });

  it('should create FinanceTransaction entity successfully', () => {
    const result = FinanceTransaction.create({
      id: 'tx_123',
      propertyId: 'prop_123',
      scope: 'CLIENT',
      date: new Date(),
      type: 'INCOME',
      category: 'reserva',
      channel: 'booking',
      description: 'Hóspede João da Silva',
      amount: 1200.0,
      status: 'CONFIRMED',
      metadata: null,
    });

    expect(result.isOk).toBe(true);
    expect(result.value.amount).toBe(1200.0);
  });

  it('should create FinanceAlert entity successfully', () => {
    const result = FinanceAlert.create({
      id: 'alert_123',
      propertyId: 'prop_123',
      scope: 'CLIENT',
      type: 'cost_spike',
      severity: 'WARNING',
      agentName: 'Maria',
      message: 'Custo de lavanderia subiu 40%',
      metric: { increase: 40 },
      isRead: false,
      actionTaken: null,
    });

    expect(result.isOk).toBe(true);
    expect(result.value.severity).toBe('WARNING');
    expect(result.value.isRead).toBe(false);
  });
});

describe('ZEHLA Finance HTTP APIs', () => {
  it('should get dashboard data successfully via GET route', async () => {
    const req = new Request('http://localhost:3000/api/zcc/finance/dashboard?propertyId=prop_sol_001', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.healthScore).toBe(75);
    expect(json.data.aiInsight).toBe('Insight de teste');
  });

  it('should reply to finance chat successfully via POST route', async () => {
    const req = new Request('http://localhost:3000/api/zcc/finance/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyId: 'prop_sol_001',
        message: 'Qual a receita acumulada?'
      }),
    });

    const res = await ChatPOST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.reply).toBeDefined();
  });
});
