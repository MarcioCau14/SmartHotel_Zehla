import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi, beforeEach } from 'vitest';

afterEach(() => {
  cleanup();
});

global.IntersectionObserver = class MockIntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [0];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] { return []; }
} as unknown as typeof IntersectionObserver;

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock session storage for tests
let mockSession = null;

// Mock next-auth
vi.mock('next-auth', () => ({
  __esModule: true,
  default: vi.fn().mockImplementation(() => {
    return {
      GET: vi.fn(),
      POST: vi.fn(),
    };
  }),
  getServerSession: vi.fn().mockImplementation(() => Promise.resolve(mockSession)),
}));

// Helper to set mock session for tests
export const setMockSession = (session: any) => {
  mockSession = session;
};

// Helper to clear mock session
export const clearMockSession = () => {
  mockSession = null;
};
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('z-ai-web-dev-sdk', () => ({
  default: {
    create: vi.fn().mockResolvedValue({
      chat: {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: 'Mock AI response' } }],
          }),
        },
      },
    }),
  },
}));

beforeEach(() => {
  global.fetch = vi.fn().mockImplementation(async (url: RequestInfo | URL, options?: RequestInit) => {
    const urlStr = typeof url === 'string' ? url : typeof url === 'object' && 'url' in url ? (url as Request).url : String(url);

    if (urlStr.includes('/api/reservations') && (!options || options.method === 'GET')) {
      return new Response(JSON.stringify([
        { id: 'res-001', guestName: 'Ana Silva', roomNumber: '101', checkIn: '2026-05-23', checkOut: '2026-05-26', status: 'CONFIRMED', totalAmount: 840 },
      ]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (urlStr.includes('/api/reservations') && options?.method === 'POST') {
      return new Response(JSON.stringify({ id: 'res-002', guestName: 'Pedro Santos', status: 'PENDING' }), { status: 201, headers: { 'Content-Type': 'application/json' } });
    }

    if (urlStr.includes('/api/rooms')) {
      return new Response(JSON.stringify([
        { id: 'room-1', number: '101', status: 'available', type: 'Standard', price: 280 },
        { id: 'room-2', number: '102', status: 'occupied', type: 'Luxo', price: 450 },
      ]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (urlStr.includes('/api/revenue/kpis')) {
      return new Response(JSON.stringify({ todayRevenue: 14780, occupancyRate: 85.3, avgDailyRate: 420 }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (urlStr.includes('/api/agents')) {
      return new Response(JSON.stringify([
        { id: 'agent-1', name: 'Recepcionista', role: 'Atendimento', status: 'active' },
      ]), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (urlStr.includes('/api/marketing/leads')) {
      return new Response(JSON.stringify({ leads: [], total: 0 }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (urlStr.includes('/api/terminal')) {
      return new Response(JSON.stringify({ status: 'ok', uptime: 3600 }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    if (urlStr.includes('/api/trial')) {
      return new Response(JSON.stringify({ success: true, message: 'Trial created' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({}), { status: 200, headers: { 'Content-Type': 'application/json' } });
  });
});
