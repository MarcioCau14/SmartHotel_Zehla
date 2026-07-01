import { NextRequest } from 'next/server';
import { vi, expect } from 'vitest';

export function createRequest(
  path: string,
  options?: {
    method?: string;
    body?: Record<string, unknown>;
    headers?: Record<string, string>;
    searchParams?: Record<string, string>;
  },
): NextRequest {
  const url = new URL(path, 'http://localhost:3000');

  if (options?.searchParams) {
    Object.entries(options.searchParams).forEach(([k, v]) => {
      url.searchParams.set(k, v);
    });
  }

  const init: RequestInit = {
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  };

  if (options?.body && options.method !== 'GET') {
    init.body = JSON.stringify(options.body);
  }

  return new NextRequest(url, init);
}

function createModelMock() {
  return {
    findMany: vi.fn().mockResolvedValue([]),
    findFirst: vi.fn().mockResolvedValue(null),
    findUnique: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({ id: 'mock-id' }),
    createMany: vi.fn().mockResolvedValue({ count: 0 }),
    update: vi.fn().mockResolvedValue({ id: 'mock-id' }),
    updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    delete: vi.fn().mockResolvedValue({ id: 'mock-id' }),
    deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    count: vi.fn().mockResolvedValue(0),
    aggregate: vi.fn().mockResolvedValue({ _count: 0, _sum: {}, _avg: {} }),
    upsert: vi.fn().mockResolvedValue({ id: 'mock-id' }),
    groupBy: vi.fn().mockResolvedValue([]),
  };
}

export function createMockDb() {
  const dbInstance = {
    user: createModelMock(),
    tenant: createModelMock(),
    property: createModelMock(),
    room: createModelMock(),
    lead: createModelMock(),
    target: createModelMock(),
    campaign: createModelMock(),
    swipeTemplate: createModelMock(),
    agentLog: createModelMock(),
    agentConfig: createModelMock(),
    apiConfig: createModelMock(),
    auditLog: createModelMock(),
    securityAlert: createModelMock(),
    routerProvider: createModelMock(),
    budgetGuardState: createModelMock(),
    guest: createModelMock(),
    guestMessage: createModelMock(),
    booking: createModelMock(),
    conversationLog: createModelMock(),
    conversationMessage: createModelMock(),
    notification: createModelMock(),
    trainingPrompt: createModelMock(),
    knowledgeEntry: createModelMock(),
    performanceSnapshot: createModelMock(),
    quickAction: createModelMock(),
    aIActivityLog: createModelMock(),
    subscription: createModelMock(),
    paymentTransaction: createModelMock(),
    trendKeyword: createModelMock(),
    trendDataPoint: createModelMock(),
    feedback: createModelMock(),
    $connect: vi.fn().mockResolvedValue(undefined),
    $disconnect: vi.fn().mockResolvedValue(undefined),
    $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
    $transaction: vi.fn(),
  };

  (dbInstance as any).$transaction.mockImplementation(async (fn: any) => {
    if (typeof fn === 'function') return fn(dbInstance);
    return fn;
  });

  return dbInstance;
}

export async function expectJson(
  response: Response,
  status: number,
) {
  expect(response.status).toBe(status);
  const body = await response.json();
  expect(body).toBeDefined();
  return body;
}

export function expectSuccess(body: Record<string, unknown>) {
  expect(body.success).toBe(true);
}

export function expectError(body: Record<string, unknown>) {
  expect(body.success).toBeFalsy();
  expect(body.error).toBeDefined();
}

// ─── Mock Data Factories ──────────────────────────────────────────────

export const mockGuest = {
  id: 'guest-1',
  tenantId: 'client-001',
  name: 'Maria Silva',
  phone: '+5521999990001',
  email: 'maria@email.com',
  status: 'hot',
  aiScore: 85,
  conversationCount: 5,
  lastContact: new Date(),
  metadata: '{}',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockBooking = {
  id: 'booking-1',
  tenantId: 'client-001',
  guestId: 'guest-1',
  guestName: 'Maria Silva',
  roomName: 'Suite Master',
  checkIn: new Date(),
  checkOut: new Date(Date.now() + 3 * 86400000),
  nights: 3,
  guests: 2,
  totalValue: 1200,
  status: 'confirmed',
  paymentStatus: 'paid',
  source: 'whatsapp_ai',
  metadata: '{}',
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockConversation = {
  id: 'conv-1',
  tenantId: 'client-001',
  guestId: 'guest-1',
  guestName: 'Maria Silva',
  guestPhone: '+5521999990001',
  status: 'active',
  lastUpdate: new Date(),
  aiConfidence: 92,
  metadata: '{}',
  messages: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const mockNotification = {
  id: 'notif-1',
  tenantId: 'client-001',
  type: 'booking',
  priority: 'high',
  title: 'Nova reserva',
  message: 'Maria Silva reservou a Suite Master',
  actionUrl: null,
  actionLabel: null,
  read: false,
  metadata: '{}',
  createdAt: new Date(),
};

export const mockTrainingPrompt = {
  id: 'training-1',
  tenantId: 'client-001',
  name: 'Recepcionista Acolhedora',
  type: 'persona',
  content: 'Você é uma recepcionista simpática...',
  variables: '[]',
  isActive: true,
  successRate: 88,
  usageCount: 42,
  lastUsed: new Date(),
  metadata: '{}',
  createdAt: new Date(),
  updatedAt: new Date(),
};
