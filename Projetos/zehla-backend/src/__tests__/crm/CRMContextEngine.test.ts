import { describe, it, expect } from 'vitest'
import { CRMPipelineStage, CRM_ROUTING_CONFIGS, ICPersona, podeTransitar, transitar } from '../../domain/crm/models/CRMPipelineStage'
import { LeadProfile } from '../../domain/crm/models/LeadProfile'
import { CRMContextEnvelope } from '../../domain/crm/models/CRMContextEnvelope'
import { CRMContextProvider } from '../../domain/crm/services/CRMContextProvider'
import { InMemoryCRMAdapter } from '../../infrastructure/persistence/memory/InMemoryCRMAdapter'

function leadBase(overrides?: Partial<Parameters<typeof LeadProfile.create>[0]>) {
  return {
    id: 'lead-1',
    nome: 'Maria Silva',
    telefone: '5511999999999',
    email: 'maria@test.com',
    canalOrigem: 'whatsapp',
    ltvScore: 75,
    stage: CRMPipelineStage.ENTRADA,
    createdAt: new Date('2026-01-01'),
    propriedadeId: 'prop-1',
    persona: ICPersona.HOSPEDE_ROMANTICO,
    totalSpentUsd: 1200,
    staysCount: 3,
    lastInteractionAt: new Date('2026-05-01'),
    ...overrides,
  }
}

describe('Tese 1 — CRM Context Engine', () => {
  describe('CRMPipelineStage', () => {
    it('T1.1: CRMPipelineStage enum tem 6 valores', () => {
      const stages = Object.values(CRMPipelineStage)
      expect(stages).toHaveLength(6)
      expect(stages).toContain(CRMPipelineStage.ENTRADA)
      expect(stages).toContain(CRMPipelineStage.QUALIFICACAO)
      expect(stages).toContain(CRMPipelineStage.PROPOSTA)
      expect(stages).toContain(CRMPipelineStage.NEGOCIACAO)
      expect(stages).toContain(CRMPipelineStage.FECHAMENTO)
      expect(stages).toContain(CRMPipelineStage.PERDA_TEMPORARIA)
    })

    it('T1.2: CRM_ROUTING_CONFIGS tem config para cada stage', () => {
      for (const stage of Object.values(CRMPipelineStage)) {
        expect(CRM_ROUTING_CONFIGS.has(stage)).toBe(true)
        const config = CRM_ROUTING_CONFIGS.get(stage)!
        expect(config.stage).toBe(stage)
        expect([1, 2, 3]).toContain(config.minTier)
      }
    })

    it('T1.3: NEGOCIACAO requireHumanEscalation true', () => {
      const config = CRM_ROUTING_CONFIGS.get(CRMPipelineStage.NEGOCIACAO)!
      expect(config.requireHumanEscalation).toBe(true)
      expect(config.minTier).toBe(3)
      expect(config.budgetPriority).toBe('critical')
    })
  })

  describe('LeadProfile', () => {
    it('T1.4: Cria com dados válidos', () => {
      const result = LeadProfile.create(leadBase())
      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value.id).toBe('lead-1')
        expect(result.value.nome).toBe('Maria Silva')
        expect(result.value.persona).toBe(ICPersona.HOSPEDE_ROMANTICO)
        expect(result.value.totalSpentUsd).toBe(1200)
        expect(result.value.staysCount).toBe(3)
      }
    })

    it('T1.5: Rejeita leadId vazio', () => {
      const result = LeadProfile.create(leadBase({ id: '' }))
      expect(result.isFail).toBe(true)
    })

    it('T1.6: Rejeita ltvScore fora do range', () => {
      const result = LeadProfile.create(leadBase({ ltvScore: 150 }))
      expect(result.isFail).toBe(true)
    })

    it('T1.7: isHighValue true para ltvScore >= 70', () => {
      const result = LeadProfile.create(leadBase({ ltvScore: 70 }))
      expect(result.isOk).toBe(true)
      if (result.isOk) expect(result.value.isHighValue).toBe(true)
    })

    it('T1.8: isHighValue true para totalSpentUsd >= 500', () => {
      const result = LeadProfile.create(leadBase({ ltvScore: 30, totalSpentUsd: 500 }))
      expect(result.isOk).toBe(true)
      if (result.isOk) expect(result.value.isHighValue).toBe(true)
    })

    it('T1.9: requiresHumanCloser true para NEGOCIACAO', () => {
      const result = LeadProfile.create(leadBase({ stage: CRMPipelineStage.NEGOCIACAO }))
      expect(result.isOk).toBe(true)
      if (result.isOk) expect(result.value.requiresHumanCloser).toBe(true)
    })

    it('T1.10: requiresHumanCloser true para PRODUTOR_B2B', () => {
      const result = LeadProfile.create(leadBase({ persona: ICPersona.PRODUTOR_B2B }))
      expect(result.isOk).toBe(true)
      if (result.isOk) expect(result.value.requiresHumanCloser).toBe(true)
    })

    it('T1.11: withStage retorna nova instância (imutabilidade)', () => {
      const result = LeadProfile.create(leadBase())
      expect(result.isOk).toBe(true)
      if (result.isOk) {
        const original = result.value
        const atualizado = original.withStage(CRMPipelineStage.QUALIFICACAO)
        expect(atualizado.isOk).toBe(true)
        if (atualizado.isOk) {
          expect(atualizado.value.stage).toBe(CRMPipelineStage.QUALIFICACAO)
          expect(original.stage).toBe(CRMPipelineStage.ENTRADA)
        }
      }
    })

    it('T1.12: daysSinceLastInteraction calcula corretamente', () => {
      const trintaDiasAtras = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const result = LeadProfile.create(leadBase({ lastInteractionAt: trintaDiasAtras }))
      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value.daysSinceLastInteraction).toBeGreaterThanOrEqual(29)
        expect(result.value.daysSinceLastInteraction).toBeLessThanOrEqual(31)
      }
    })
  })

  describe('CRMContextEnvelope', () => {
    it('T1.13: fromProfile cria snapshot com dados corretos', () => {
      const profile = LeadProfile.create(leadBase())
      expect(profile.isOk).toBe(true)
      if (!profile.isOk) return
      const envelope = CRMContextEnvelope.fromProfile(profile.value)

      expect(envelope.snapshot.leadId).toBe('lead-1')
      expect(envelope.snapshot.persona).toBe(ICPersona.HOSPEDE_ROMANTICO)
      expect(envelope.snapshot.isHighValue).toBe(true)
      expect(envelope.snapshot.originChannel).toBe('whatsapp')
    })

    it('T1.14: toMetadataEntry retorna estrutura compatível com RoutingContext', () => {
      const profile = LeadProfile.create(leadBase())
      expect(profile.isOk).toBe(true)
      if (!profile.isOk) return
      const envelope = CRMContextEnvelope.fromProfile(profile.value)
      const entry = envelope.toMetadataEntry()

      expect(entry.key).toBe('crm')
      expect(entry.value.leadId).toBe('lead-1')
      expect(Object.isFrozen(entry)).toBe(true)
      expect(Object.isFrozen(entry.value)).toBe(true)
    })
  })

  describe('CRMContextProvider', () => {
    it('T1.15: enrichContext retorna null para lead inexistente', async () => {
      const adapter = new InMemoryCRMAdapter()
      const provider = new CRMContextProvider(adapter)
      const result = await provider.enrichContext('inexistente')
      expect(result.leadExists).toBe(false)
      expect(result.envelope).toBeNull()
    })

    it('T1.16: enrichContext retorna envelope para lead existente por ID', async () => {
      const adapter = new InMemoryCRMAdapter()
      const profile = LeadProfile.create(leadBase())
      expect(profile.isOk).toBe(true)
      if (!profile.isOk) return
      await adapter.salvarLead(profile.value)

      const provider = new CRMContextProvider(adapter)
      const result = await provider.enrichContext('lead-1')
      expect(result.leadExists).toBe(true)
      expect(result.envelope).not.toBeNull()
      expect(result.envelope!.snapshot.leadId).toBe('lead-1')
    })

    it('T1.17: enrichContext busca por telefone se ID não encontrar', async () => {
      const adapter = new InMemoryCRMAdapter()
      const profile = LeadProfile.create(leadBase({ id: 'lead-2' }))
      expect(profile.isOk).toBe(true)
      if (!profile.isOk) return
      await adapter.salvarLead(profile.value)

      const provider = new CRMContextProvider(adapter)
      const result = await provider.enrichContext('5511999999999')
      expect(result.leadExists).toBe(true)
      expect(result.envelope).not.toBeNull()
      expect(result.envelope!.snapshot.leadId).toBe('lead-2')
    })

    it('T1.18: loadedInMs é um número positivo', async () => {
      const adapter = new InMemoryCRMAdapter()
      const profile = LeadProfile.create(leadBase())
      expect(profile.isOk).toBe(true)
      if (!profile.isOk) return
      await adapter.salvarLead(profile.value)

      const provider = new CRMContextProvider(adapter)
      const result = await provider.enrichContext('lead-1')
      expect(result.loadedInMs).toBeGreaterThanOrEqual(0)
    })
  })

  describe('InMemoryCRMAdapter', () => {
    it('T1.19: ciclo completo seed + load + update + list', async () => {
      const adapter = new InMemoryCRMAdapter()

      const p1 = LeadProfile.create(leadBase({ id: 'l1', nome: 'Ana', stage: CRMPipelineStage.ENTRADA }))
      const p2 = LeadProfile.create(leadBase({ id: 'l2', nome: 'Beto', stage: CRMPipelineStage.QUALIFICACAO }))
      expect(p1.isOk).toBe(true)
      expect(p2.isOk).toBe(true)
      if (!p1.isOk || !p2.isOk) return

      await adapter.salvarLead(p1.value)
      await adapter.salvarLead(p2.value)

      const entrada = await adapter.listarLeadsPorStage(CRMPipelineStage.ENTRADA)
      expect(entrada.isOk).toBe(true)
      if (entrada.isOk) expect(entrada.value).toHaveLength(1)

      await adapter.atualizarStage('l1', CRMPipelineStage.QUALIFICACAO)
      const qualificados = await adapter.listarLeadsPorStage(CRMPipelineStage.QUALIFICACAO)
      expect(qualificados.isOk).toBe(true)
      if (qualificados.isOk) expect(qualificados.value).toHaveLength(2)
    })

    it('T1.20: Object.freeze verificado em todos os VOs', () => {
      const profile = LeadProfile.create(leadBase())
      expect(profile.isOk).toBe(true)
      if (profile.isOk) {
        expect(Object.isFrozen(profile.value)).toBe(true)
        expect(Object.isFrozen(profile.value.tags)).toBe(true)
      }

      const envelope = CRMContextEnvelope.fromProfile(
        profile.isOk ? profile.value : LeadProfile.create(leadBase()).value!
      )
      expect(Object.isFrozen(envelope.snapshot)).toBe(true)
    })
  })
})
