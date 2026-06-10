import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProcessFollowUpUseCase } from '../../../../src/application/comercial/use-cases/ProcessFollowUpUseCase'
import { InMemoryComercialLeadAdapter } from '../../../../src/infrastructure/persistence/comercial/InMemoryComercialLeadAdapter'
import { ComercialLead } from '../../../../src/domain/comercial/entities/ComercialLead'
import { LeadScore } from '../../../../src/domain/comercial/value-objects/LeadScore'
import { OrigemLead } from '../../../../src/domain/comercial/value-objects/OrigemLead'
import { Result } from '../../../../src/shared/Result'
import { IMessagingGateway, MessagingError } from '../../../../src/domain/marketing/ports/IMessagingGateway'
import { DomainEventPublisher } from '../../../../src/domain/shared/events/DomainEventPublisher'

// Simple mock for IMessagingGateway
class MockMessagingGateway implements IMessagingGateway {
  public sentMessages: Array<{ phone: string; message: string }> = []
  public shouldFail = false

  async sendText(phone: string, message: string): Promise<Result<void, MessagingError>> {
    if (this.shouldFail) {
      return Result.fail(new MessagingError('API Connection Timeout'))
    }
    this.sentMessages.push({ phone, message })
    return Result.ok(undefined)
  }

  async sendTemplate(
    phone: string,
    templateId: string,
    variables: Record<string, string>
  ): Promise<Result<void, MessagingError>> {
    return Result.ok(undefined)
  }
}

describe('ProcessFollowUpUseCase Unit Tests', () => {
  let leadAdapter: InMemoryComercialLeadAdapter
  let messagingGateway: MockMessagingGateway
  let eventPublisher: DomainEventPublisher
  let useCase: ProcessFollowUpUseCase

  beforeEach(() => {
    leadAdapter = new InMemoryComercialLeadAdapter()
    messagingGateway = new MockMessagingGateway()
    eventPublisher = new DomainEventPublisher()
    useCase = new ProcessFollowUpUseCase(leadAdapter, messagingGateway, eventPublisher)
  })

  function createLeadInState(state: 'entrada' | 'primeira_interacao' | 'follow_up_1', hasPhone = true) {
    const origem = OrigemLead.criar('site').value as OrigemLead
    const score = LeadScore.criar(80, 'ideal', {
      budget: true, authority: true, need: true, timeline: true,
    }).value as LeadScore

    let lead = ComercialLead.create({
      id: 'lead_followup_999',
      origem,
      propriedadeId: 'prop_xyz_789',
      nome: 'Carlos Drummond',
      score,
      sdrResponsavel: 'ze_sales',
      telefone: hasPhone ? '5511988887777' : undefined,
    }).value as ComercialLead

    if (state === 'primeira_interacao') {
      lead = lead.primeiroContato().value as ComercialLead
    } else if (state === 'follow_up_1') {
      lead = lead.primeiroContato().value as ComercialLead
      lead = lead.realizarFollowUp().value as ComercialLead
    }

    leadAdapter.salvarMock(lead)
    return lead
  }

  it('should format message dynamically and transition lead to follow_up_1 on ENGAJAMENTO cadence', async () => {
    createLeadInState('primeira_interacao')

    const input = {
      leadId: 'lead_followup_999',
      cadenceType: 'ENGAJAMENTO' as const,
      roiData: {
        score: 85,
        category: 'Brains',
        lgpdRisk: 'LOW',
        playbookUrl: '/playbooks/playbook_prop_xyz_789.md'
      }
    }

    const result = await useCase.execute(input)
    expect(result.isOk).toBe(true)

    // Verify message was sent with correct format
    expect(messagingGateway.sentMessages.length).toBe(1)
    const sent = messagingGateway.sentMessages[0]
    expect(sent.phone).toBe('5511988887777')
    expect(sent.message).toContain('Olá Carlos Drummond!')
    expect(sent.message).toContain('Seu score de maturidade é 85/100')
    expect(sent.message).toContain('/playbooks/playbook_prop_xyz_789.md')

    // Verify lead state was updated to follow_up_1
    const updatedLeadResult = await leadAdapter.buscarPorId('lead_followup_999')
    expect(updatedLeadResult.isOk).toBe(true)
    expect(updatedLeadResult.value?.estado).toBe('follow_up_1')
  })

  it('should send default follow-up message when no roiData is provided', async () => {
    createLeadInState('primeira_interacao')

    const input = {
      leadId: 'lead_followup_999',
      cadenceType: 'ENGAJAMENTO' as const
    }

    const result = await useCase.execute(input)
    expect(result.isOk).toBe(true)

    expect(messagingGateway.sentMessages.length).toBe(1)
    const sent = messagingGateway.sentMessages[0]
    expect(sent.message).toBe('Olá Carlos Drummond, gostaríamos de dar continuidade ao nosso contato. Como estão as coisas por aí?')

    const updatedLeadResult = await leadAdapter.buscarPorId('lead_followup_999')
    expect(updatedLeadResult.value?.estado).toBe('follow_up_1')
  })

  it('should return error when lead does not exist', async () => {
    const input = {
      leadId: 'non_existing_lead',
      cadenceType: 'ENGAJAMENTO' as const
    }

    const result = await useCase.execute(input)
    expect(result.isFail).toBe(true)
    expect(result.error.message).toBe('LEAD_NAO_ENCONTRADO')
  })

  it('should return error when lead has no phone number', async () => {
    createLeadInState('primeira_interacao', false) // No phone

    const input = {
      leadId: 'lead_followup_999',
      cadenceType: 'ENGAJAMENTO' as const
    }

    const result = await useCase.execute(input)
    expect(result.isFail).toBe(true)
    expect(result.error.message).toBe('LEAD_SEM_TELEFONE')
  })

  it('should return error and fail-fast if messaging gateway returns failure', async () => {
    createLeadInState('primeira_interacao')
    messagingGateway.shouldFail = true

    const input = {
      leadId: 'lead_followup_999',
      cadenceType: 'ENGAJAMENTO' as const
    }

    const result = await useCase.execute(input)
    expect(result.isFail).toBe(true)
    expect(result.error.message).toBe('API Connection Timeout')

    // Lead state should remain unchanged in database
    const updatedLeadResult = await leadAdapter.buscarPorId('lead_followup_999')
    expect(updatedLeadResult.value?.estado).toBe('primeira_interacao')
  })
})
