// src/__tests__/swipe/SwipeIntelligence.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { classificarTier } from '../../lib/swipe/classifier';
import { matchSwipes } from '../../lib/swipe/matcher';
import { 
  registrarUsoSwipe, 
  registrarConversaoSwipe, 
  registrarIgnorado, 
  registrarFeedback, 
  recalcularTodosRankings 
} from '../../lib/swipe/tracker';
import { seedSwipes } from '../../lib/swipe/seed-swipes';
import { GET as apiGetSwipes, POST as apiPostSwipe } from '../../app/api/swipes/route';
import { POST as apiMatchSwipe } from '../../app/api/swipes/match/route';
import { POST as apiTrackSwipe } from '../../app/api/swipes/track/route';
import { POST as apiSeedSwipes } from '../../app/api/swipes/seed/route';
import { GET as apiStatsSwipes } from '../../app/api/swipes/stats/route';
import { executeAction } from '../../lib/events/actions';

// Mock do prisma em memória para testes 100% isolados
const mockTemplates: any[] = [];
const mockUsages: any[] = [];
const mockLeads: any[] = [];

vi.mock('@/lib/prisma', () => {
  return {
    prisma: {
      swipeTemplate: {
        findMany: vi.fn().mockImplementation((args) => {
          let list = [...mockTemplates];
          if (args?.where) {
            const w = args.where;
            if (w.isActive !== undefined) {
              list = list.filter(t => t.isActive === w.isActive);
            }
            if (w.channel) {
              if (typeof w.channel === 'object' && w.channel.in) {
                list = list.filter(t => w.channel.in.includes(t.channel));
              } else {
                list = list.filter(t => t.channel === w.channel);
              }
            }
            if (w.category) {
              list = list.filter(t => t.category === w.category);
            }
            if (w.tier) {
              list = list.filter(t => t.tier === w.tier);
            }
          }
          return Promise.resolve(list);
        }),
        findFirst: vi.fn().mockImplementation((args) => {
          const w = args?.where;
          const found = mockTemplates.find(t => {
            if (w?.title && t.title !== w.title) return false;
            return true;
          });
          return Promise.resolve(found || null);
        }),
        findUnique: vi.fn().mockImplementation((args) => {
          const found = mockTemplates.find(t => t.id === args.where.id);
          return Promise.resolve(found || null);
        }),
        create: vi.fn().mockImplementation((args) => {
          const newTemplate = {
            id: `swipe_${Date.now()}_${Math.random()}`,
            isActive: true,
            timesUsed: 0,
            conversions: 0,
            convRate: 0,
            lastUsedAt: null,
            provenByConversion: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...args.data
          };
          mockTemplates.push(newTemplate);
          return Promise.resolve(newTemplate);
        }),
        update: vi.fn().mockImplementation((args) => {
          const idx = mockTemplates.findIndex(t => t.id === args.where.id);
          if (idx !== -1) {
            const updateData = { ...args.data };
            for (const key of Object.keys(updateData)) {
              if (updateData[key] && typeof updateData[key] === 'object' && 'increment' in updateData[key]) {
                const currentVal = mockTemplates[idx][key] || 0;
                updateData[key] = currentVal + updateData[key].increment;
              }
            }
            mockTemplates[idx] = { ...mockTemplates[idx], ...updateData };
            return Promise.resolve(mockTemplates[idx]);
          }
          return Promise.resolve(null);
        }),
        count: vi.fn().mockImplementation(() => Promise.resolve(mockTemplates.length)),
      },
      swipeUsage: {
        upsert: vi.fn().mockImplementation((args) => {
          const { swipeId, leadId } = args.where.swipeId_leadId;
          const idx = mockUsages.findIndex(u => u.swipeId === swipeId && u.leadId === leadId);
          if (idx !== -1) {
            mockUsages[idx] = { ...mockUsages[idx], ...args.update };
            return Promise.resolve(mockUsages[idx]);
          } else {
            const newUsage = {
              id: `usage_${Date.now()}_${Math.random()}`,
              swipeId,
              leadId,
              wasUsed: true,
              converted: null,
              agentId: null,
              responseTimeMs: null,
              feedback: null,
              createdAt: new Date(),
              ...args.create
            };
            mockUsages.push(newUsage);
            return Promise.resolve(newUsage);
          }
        }),
        update: vi.fn().mockImplementation((args) => {
          const { swipeId, leadId } = args.where.swipeId_leadId;
          const idx = mockUsages.findIndex(u => u.swipeId === swipeId && u.leadId === leadId);
          if (idx !== -1) {
            mockUsages[idx] = { ...mockUsages[idx], ...args.data };
            return Promise.resolve(mockUsages[idx]);
          }
          return Promise.resolve(null);
        }),
        count: vi.fn().mockImplementation((args) => {
          let list = [...mockUsages];
          const w = args?.where;
          if (w) {
            if (w.swipeId) list = list.filter(u => u.swipeId === w.swipeId);
            if (w.wasUsed !== undefined) list = list.filter(u => u.wasUsed === w.wasUsed);
            if (w.converted !== undefined) list = list.filter(u => u.converted === w.converted);
          }
          return Promise.resolve(list.length);
        })
      },
      lead: {
        findUnique: vi.fn().mockImplementation((args) => {
          const found = mockLeads.find(l => l.id === args.where.id);
          if (found) {
            return Promise.resolve({
              ...found,
              events: found.events || []
            });
          }
          return Promise.resolve(null);
        }),
        update: vi.fn().mockImplementation((args) => {
          const idx = mockLeads.findIndex(l => l.id === args.where.id);
          if (idx !== -1) {
            mockLeads[idx] = { ...mockLeads[idx], ...args.data };
            return Promise.resolve(mockLeads[idx]);
          }
          return Promise.resolve(null);
        })
      },
      $transaction: vi.fn().mockImplementation((callback) => callback(prisma))
    }
  };
});

// Reimportar o mock para usar nos asserts locais se necessário
import { prisma } from '@/lib/prisma';

describe('ZEHLA Swipe Intelligence Domain & Rules', () => {
  beforeEach(() => {
    mockTemplates.length = 0;
    mockUsages.length = 0;
    mockLeads.length = 0;
    vi.clearAllMocks();
  });

  describe('ZEHLA Tier Classifier (classificarTier)', () => {
    it('should classify high-ticket SC/Caminho do Rei benchmark as MAX', () => {
      const profile = {
        id: 'lead_1',
        email: 'elite@caminhodorei.com',
        pousada: 'Pousada Caminho do Rei',
        score: 95,
        tier: 'pro',
        cluster: 'pousada' as const,
        dor: 'ocupacao' as const,
        funnelStage: 'HOT' as const,
        qtdQuartos: 20,
        regiao: 'Sul',
        uf: 'SC',
        totalEventos: 12,
        canaisUsados: ['whatsapp', 'email']
      };

      const result = classificarTier(profile, []);
      expect(result.tier).toBe('max');
      expect(result.confidence).toBeGreaterThan(0.4);
      expect(result.reasons).toContain("Perfil detectado como High-Ticket (Similar a Caminho do Rei) — Foco em Taxa Zero.");
      expect(result.roiProjection).toBe(798 * result.confidence);
    });

    it('should classify compact pousada benchmark as LITE', () => {
      const profile = {
        id: 'lead_2',
        email: 'compact@casa.com',
        pousada: 'Casa dos Ventos',
        score: 15,
        tier: 'lite',
        cluster: 'pousada' as const,
        dor: 'financeiro' as const,
        funnelStage: 'NEUTRAL' as const,
        qtdQuartos: 3,
        regiao: 'Nordeste',
        uf: 'CE',
        totalEventos: 2,
        canaisUsados: ['whatsapp']
      };

      const result = classificarTier(profile, []);
      expect(result.tier).toBe('lite');
      expect(result.reasons).toContain("Perfil Pousada Compacta (Similar a Casa dos Ventos) — Foco em Baixo Custo Fixo.");
    });
  });

  describe('ZEHLA Swipe Matcher (matchSwipes)', () => {
    it('should match template by pain points, score and channel preferences', async () => {
      // Setup mock templates
      mockTemplates.push(
        {
          id: 'temp_financeiro_wa',
          title: 'Template Finanças WhatsApp',
          content: 'Automatize suas finanças {{NOME}}',
          channel: 'whatsapp',
          category: 'preco',
          tier: 'pro',
          painType: 'financeiro',
          convRate: 0.15,
          isActive: true
        },
        {
          id: 'temp_ocupacao_wa',
          title: 'Template Ocupação WhatsApp',
          content: 'Aumente sua ocupação {{NOME}}',
          channel: 'whatsapp',
          category: 'disponibilidade',
          tier: 'max',
          painType: 'ocupacao',
          convRate: 0.25,
          isActive: true
        }
      );

      const profile = {
        id: 'lead_3',
        email: 'pousada@finances.com',
        pousada: 'Pousada Finanças',
        score: 75,
        tier: 'pro',
        cluster: 'pousada' as const,
        dor: 'financeiro' as const,
        funnelStage: 'HOT' as const,
        qtdQuartos: 8,
        regiao: 'Sudeste',
        uf: 'SP',
        totalEventos: 6,
        canaisUsados: ['whatsapp']
      };

      const result = await matchSwipes(profile, { channel: 'whatsapp' });
      expect(result.matches.length).toBeGreaterThan(0);
      expect(result.matches[0].swipe.id).toBe('temp_financeiro_wa');
      expect(result.matches[0].reasons.some(r => r.includes('Match de Dor'))).toBe(true);
    });
  });

  describe('ZEHLA Swipe Tracker & Recalculate', () => {
    it('should track usage and recalculate template conversion rate on conversion', async () => {
      // Setup mock template
      const temp = await prisma.swipeTemplate.create({
        data: {
          title: 'WhatsApp Promo',
          content: 'Promoção para {{NOME}}',
          channel: 'whatsapp',
          category: 'promocao',
          tier: 'pro',
          painType: 'financeiro',
          tags: ['promo']
        }
      });

      mockLeads.push({
        id: 'lead_test',
        email: 'test@lead.com',
        events: []
      });

      // Registrar uso
      await registrarUsoSwipe(temp.id, 'lead_test', 'agent_jony');

      const templateUpdatedAfterUse = mockTemplates.find(t => t.id === temp.id);
      expect(templateUpdatedAfterUse.timesUsed).toBe(1);
      expect(templateUpdatedAfterUse.convRate).toBe(0);

      // Registrar conversão
      await registrarConversaoSwipe('lead_test');

      const templateUpdatedAfterConv = mockTemplates.find(t => t.id === temp.id);
      expect(templateUpdatedAfterConv.conversions).toBe(1);
      expect(templateUpdatedAfterConv.convRate).toBe(1.0);
      expect(templateUpdatedAfterConv.provenByConversion).toBe(true);
    });
  });

  describe('ZEHLA Swipe APIs & Action Integration', () => {
    it('should seed database via seed API successfully', async () => {
      const response = await apiSeedSwipes(new Request('http://localhost/api/swipes/seed', { method: 'POST' }) as any);
      const data = await response.json();
      expect(data.status).toBe('success');
      expect(data.criados).toBeGreaterThan(20);
      expect(mockTemplates.length).toBe(data.criados);
    });

    it('should execute action sugerir_swipe_zcc successfully', async () => {
      // Setup seed and lead
      await seedSwipes();
      
      mockLeads.push({
        id: 'lead_action_test',
        email: 'action@pousada.com',
        property: 'Solar da Praia',
        conversionScore: 88,
        leadTier: 'pro',
        cluster: 'pousada',
        painPoints: 'ocupacao',
        funnelStage: 'HOT',
        roomsCount: 12,
        region: 'Sul',
        state: 'SC',
        events: [
          { eventSource: 'whatsapp', timestamp: new Date() }
        ]
      });

      const actionResult = await executeAction('sugerir_swipe_zcc', { leadId: 'lead_action_test' });
      expect(actionResult.status).toBe('success');
      expect(actionResult.result?.suggestedTier).toBe('max'); // classificarTier classifique como max por conta da dor 'ocupacao'
      expect(actionResult.result?.matchesCount).toBeGreaterThan(0);
    });
  });
});
