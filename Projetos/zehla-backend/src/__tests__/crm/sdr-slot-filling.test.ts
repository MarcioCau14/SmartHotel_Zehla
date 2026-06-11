import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  SlotFillingState,
  ReservationSlot,
  ALL_SLOTS,
  REQUIRED_SLOTS,
} from '../../domain/crm/models/SDRSlotFilling'
import { ProcessSDRMessageUseCase } from '../../application/crm/use-cases/ProcessSDRMessageUseCase'
import { ISlotExtractorPort, ExtractedSlot } from '../../domain/crm/ports/ISlotExtractorPort'
import { Result } from '../../shared/Result'

function createMockExtractor(results: ExtractedSlot[]): ISlotExtractorPort {
  return {
    extractSlots: vi.fn().mockResolvedValue(Result.ok(results)),
  }
}

describe('SlotFillingState', () => {
  describe('create', () => {
    it('deve criar estado com todos os slots vazios', () => {
      const state = SlotFillingState.create('s1', 'lead-123', 1000)
      expect(state.data.sessionId).toBe('s1')
      expect(state.data.leadId).toBe('lead-123')
      expect(state.data.currentTargetSlot).toBe(ReservationSlot.CHECKIN)
      expect(state.data.completedRequired).toBe(false)
      expect(state.data.allCompleted).toBe(false)
      expect(state.data.updatedAt).toBe(1000)
      expect(state.data.slots.size).toBe(ALL_SLOTS.length)
      state.data.slots.forEach(s => {
        expect(s.value).toBeNull()
        expect(s.confidence).toBe(0)
        expect(s.extractedAt).toBeNull()
      })
    })

    it('deve congelar o objeto de dados (imutável)', () => {
      const state = SlotFillingState.create('s1', 'lead-123')
      expect(Object.isFrozen(state.data)).toBe(true)
    })
  })

  describe('fillSlot', () => {
    it('deve preencher um slot e retornar novo estado imutável', () => {
      const state = SlotFillingState.create('s1', 'lead-123', 1000)
      const next = state.fillSlot(ReservationSlot.CHECKIN, '2027-06-10', 0.95, 2000)

      expect(next).not.toBe(state)
      const checkin = next.data.slots.get(ReservationSlot.CHECKIN)
      expect(checkin!.value).toBe('2027-06-10')
      expect(checkin!.confidence).toBe(0.95)
      expect(checkin!.extractedAt).toBe(2000)
      expect(next.data.updatedAt).toBe(2000)

      expect(state.data.updatedAt).toBe(1000)
      expect(state.data.slots.get(ReservationSlot.CHECKIN)!.value).toBeNull()
    })

    it('deve avançar currentTargetSlot após preencher required', () => {
      let state = SlotFillingState.create('s1', 'lead-123')
      expect(state.data.currentTargetSlot).toBe(ReservationSlot.CHECKIN)

      state = state.fillSlot(ReservationSlot.CHECKIN, '2027-06-10', 0.95)
      expect(state.data.currentTargetSlot).toBe(ReservationSlot.CHECKOUT)

      state = state.fillSlot(ReservationSlot.CHECKOUT, '2027-06-14', 0.95)
      expect(state.data.currentTargetSlot).toBe(ReservationSlot.GUESTS)

      state = state.fillSlot(ReservationSlot.GUESTS, '2 adultos', 0.95)
      expect(state.data.completedRequired).toBe(true)
      expect(state.data.currentTargetSlot).toBe(ReservationSlot.ROOM_TYPE)
    })

    it('deve marcar allCompleted quando todos os slots preenchidos', () => {
      let state = SlotFillingState.create('s1', 'lead-123')

      for (const slot of ALL_SLOTS) {
        state = state.fillSlot(slot, 'any', 0.9)
      }

      expect(state.data.allCompleted).toBe(true)
      expect(state.data.completedRequired).toBe(true)
      expect(state.data.currentTargetSlot).toBeNull()
    })

    it('deve limitar confidence ao intervalo [0, 1]', () => {
      const state = SlotFillingState.create('s1', 'lead-123')
      const high = state.fillSlot(ReservationSlot.CHECKIN, 'x', 1.5)
      expect(high.data.slots.get(ReservationSlot.CHECKIN)!.confidence).toBe(1)

      const low = state.fillSlot(ReservationSlot.CHECKOUT, 'x', -0.5)
      expect(low.data.slots.get(ReservationSlot.CHECKOUT)!.confidence).toBe(0)
    })

    it('deve pular slots já preenchidos no cálculo do próximo alvo', () => {
      let state = SlotFillingState.create('s1', 'lead-123')

      state = state.fillSlot(ReservationSlot.GUESTS, '2 adultos', 0.95)
      expect(state.data.currentTargetSlot).toBe(ReservationSlot.CHECKIN)

      state = state.fillSlot(ReservationSlot.CHECKIN, '2027-06-10', 0.95)
      state = state.fillSlot(ReservationSlot.CHECKOUT, '2027-06-14', 0.95)
      expect(state.data.completedRequired).toBe(true)
    })
  })

  describe('nextPromptType', () => {
    it('deve mapear cada slot ao tipo de prompt correto', () => {
      const state = SlotFillingState.create('s1', 'lead-123')
      expect(state.nextPromptType).toBe('ask_checkin_date')

      const withCheckin = state.fillSlot(ReservationSlot.CHECKIN, '2027-06-10', 0.95)
      expect(withCheckin.nextPromptType).toBe('ask_checkout_date')

      const withCheckout = withCheckin.fillSlot(ReservationSlot.CHECKOUT, '2027-06-14', 0.95)
      expect(withCheckout.nextPromptType).toBe('ask_guest_count')

      const withGuests = withCheckout.fillSlot(ReservationSlot.GUESTS, '2 adultos', 0.95)
      expect(withGuests.nextPromptType).toBe('ask_room_preference')

      const withRoom = withGuests.fillSlot(ReservationSlot.ROOM_TYPE, 'Suite Luxo', 0.9)
      expect(withRoom.nextPromptType).toBe('ask_budget_range')

      const withBudget = withRoom.fillSlot(ReservationSlot.BUDGET, '300-500', 0.85)
      expect(withBudget.nextPromptType).toBe('ask_guest_name')

      const withName = withBudget.fillSlot(ReservationSlot.GUEST_NAME, 'João', 0.95)
      expect(withName.nextPromptType).toBe('ask_special_requests')

      const allDone = withName.fillSlot(ReservationSlot.SPECIAL_REQUESTS, 'Vista para o mar', 0.8)
      expect(allDone.nextPromptType).toBe('booking_confirmation')
    })
  })

  describe('completionPercentage', () => {
    it('deve retornar 0% para estado inicial', () => {
      const state = SlotFillingState.create('s1', 'lead-123')
      expect(state.completionPercentage).toBe(0)
    })

    it('deve retornar ~14% para 1 slot preenchido (1/7)', () => {
      const state = SlotFillingState.create('s1', 'lead-123')
      const next = state.fillSlot(ReservationSlot.CHECKIN, '2027-06-10', 0.95)
      expect(next.completionPercentage).toBe(14)
    })

    it('deve retornar 100% para todos preenchidos', () => {
      let state = SlotFillingState.create('s1', 'lead-123')
      for (const slot of ALL_SLOTS) {
        state = state.fillSlot(slot, 'any', 0.9)
      }
      expect(state.completionPercentage).toBe(100)
    })
  })

  describe('imutabilidade', () => {
    it('deve congelar SlotState individual', () => {
      const state = SlotFillingState.create('s1', 'lead-123')
      const next = state.fillSlot(ReservationSlot.CHECKIN, '2027-06-10', 0.95)
      const checkin = next.data.slots.get(ReservationSlot.CHECKIN)!
      expect(Object.isFrozen(checkin)).toBe(true)
    })
  })

  describe('nextPromptType com fillSlot não sequencial', () => {
    it('deve priorizar required vazios mesmo que opcionais estejam preenchidos', () => {
      let state = SlotFillingState.create('s1', 'lead-123')
      state = state.fillSlot(ReservationSlot.ROOM_TYPE, 'Suite', 0.9)
      expect(state.data.currentTargetSlot).toBe(ReservationSlot.CHECKIN)
      expect(state.nextPromptType).toBe('ask_checkin_date')
    })

    it('deve avançar para opcionais quando required completos', () => {
      let state = SlotFillingState.create('s1', 'lead-123')
      state = state.fillSlot(ReservationSlot.CHECKIN, '2027-06-10', 0.95)
      state = state.fillSlot(ReservationSlot.CHECKOUT, '2027-06-14', 0.95)
      state = state.fillSlot(ReservationSlot.GUESTS, '2', 0.95)
      expect(state.data.currentTargetSlot).toBe(ReservationSlot.ROOM_TYPE)
    })
  })

  describe('edge cases', () => {
    it('deve sobrescrever slot já preenchido com novos valores', () => {
      let state = SlotFillingState.create('s1', 'lead-123')
      state = state.fillSlot(ReservationSlot.CHECKIN, '2027-06-10', 0.95, 1000)
      state = state.fillSlot(ReservationSlot.CHECKIN, '2027-07-01', 0.80, 2000)
      const checkin = state.data.slots.get(ReservationSlot.CHECKIN)!
      expect(checkin.value).toBe('2027-07-01')
      expect(checkin.confidence).toBe(0.80)
      expect(checkin.extractedAt).toBe(2000)
    })

    it('deve aceitar string vazia como valor (edge: campo textual opcional)', () => {
      const state = SlotFillingState.create('s1', 'lead-123')
      const next = state.fillSlot(ReservationSlot.SPECIAL_REQUESTS, '', 0.5)
      expect(next.data.slots.get(ReservationSlot.SPECIAL_REQUESTS)!.value).toBe('')
    })

    it('currentTargetSlot deve ser null apenas quando todos os 7 slots preenchidos', () => {
      let state = SlotFillingState.create('s1', 'lead-123')
      for (const slot of ALL_SLOTS) {
        state = state.fillSlot(slot, 'any', 0.9)
      }
      expect(state.data.currentTargetSlot).toBeNull()
    })

    it('currentTargetSlot deve manter-se no primeiro required vazio após preencher apenas opcionais', () => {
      let state = SlotFillingState.create('s1', 'lead-123')
      state = state.fillSlot(ReservationSlot.ROOM_TYPE, 'Suite', 0.9)
      state = state.fillSlot(ReservationSlot.BUDGET, '300', 0.8)
      expect(state.data.currentTargetSlot).toBe(ReservationSlot.CHECKIN)
    })
  })
})

describe('ProcessSDRMessageUseCase', () => {
  let extractor: ISlotExtractorPort
  let useCase: ProcessSDRMessageUseCase

  beforeEach(() => {
    extractor = createMockExtractor([])
    useCase = new ProcessSDRMessageUseCase(extractor)
  })

  describe('validação de entrada', () => {
    it('deve rejeitar mensagem vazia', async () => {
      const result = await useCase.execute({ message: '', sessionId: 's1', leadId: 'lead-1' })
      expect(result.isFail).toBe(true)
    })

    it('deve rejeitar sessionId vazio', async () => {
      const result = await useCase.execute({ message: 'Quero reservar', sessionId: '', leadId: 'lead-1' })
      expect(result.isFail).toBe(true)
    })

    it('deve rejeitar leadId vazio', async () => {
      const result = await useCase.execute({ message: 'Quero reservar', sessionId: 's1', leadId: '' })
      expect(result.isFail).toBe(true)
    })
  })

  describe('orquestração com extrator mockado', () => {
    it('deve criar novo estado quando existingState não fornecido', async () => {
      extractor = createMockExtractor([
        { slot: ReservationSlot.CHECKIN, value: '2027-06-10', confidence: 0.95 },
      ])
      useCase = new ProcessSDRMessageUseCase(extractor)

      const result = await useCase.execute({ message: '10 de junho', sessionId: 's1', leadId: 'lead-1' })
      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value.state.data.sessionId).toBe('s1')
        expect(result.value.state.data.leadId).toBe('lead-1')
        expect(result.value.nextPrompt).toBe('ask_checkout_date')
        expect(result.value.progress).toBe(14)
      }
    })

    it('deve aplicar múltiplos slots extraídos em uma mensagem', async () => {
      extractor = createMockExtractor([
        { slot: ReservationSlot.CHECKIN, value: '10/06/2027', confidence: 0.92 },
        { slot: ReservationSlot.CHECKOUT, value: '14/06/2027', confidence: 0.88 },
        { slot: ReservationSlot.GUESTS, value: '2 adultos e 1 criança', confidence: 0.85 },
      ])
      useCase = new ProcessSDRMessageUseCase(extractor)

      const result = await useCase.execute({ message: 'checkin 10/06, checkout 14/06, 2 adultos 1 criança', sessionId: 's1', leadId: 'lead-1' })
      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value.nextPrompt).toBe('ask_room_preference')
        expect(result.value.state.data.completedRequired).toBe(true)
        expect(result.value.state.data.allCompleted).toBe(false)
      }
    })

    it('deve continuar de estado existente', async () => {
      const existing = SlotFillingState.create('s1', 'lead-1')
        .fillSlot(ReservationSlot.CHECKIN, '2027-06-10', 0.95)

      extractor = createMockExtractor([
        { slot: ReservationSlot.CHECKOUT, value: '2027-06-14', confidence: 0.90 },
      ])
      useCase = new ProcessSDRMessageUseCase(extractor)

      const result = await useCase.execute({
        message: 'checkout 14 de junho',
        sessionId: 's1',
        leadId: 'lead-1',
        existingState: existing,
      })
      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value.state.data.slots.get(ReservationSlot.CHECKIN)!.value).toBe('2027-06-10')
        expect(result.value.state.data.slots.get(ReservationSlot.CHECKOUT)!.value).toBe('2027-06-14')
      }
    })

    it('deve propagar falha do extrator', async () => {
      extractor = { extractSlots: vi.fn().mockResolvedValue(Result.fail(new Error('Falha na extração'))) }
      useCase = new ProcessSDRMessageUseCase(extractor)

      const result = await useCase.execute({ message: 'alguma mensagem', sessionId: 's1', leadId: 'lead-1' })
      expect(result.isFail).toBe(true)
      if (result.isFail) {
        expect(result.error.message).toContain('Falha na extração')
      }
    })
  })

  describe('invariantes de negócio', () => {
    it('nextPrompt deve ser booking_confirmation quando todos os slots preenchidos', async () => {
      extractor = createMockExtractor(
        ALL_SLOTS.map(s => ({ slot: s, value: 'any', confidence: 0.9 }))
      )
      useCase = new ProcessSDRMessageUseCase(extractor)

      const result = await useCase.execute({ message: 'tudo pronto', sessionId: 's1', leadId: 'lead-1' })
      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value.nextPrompt).toBe('booking_confirmation')
        expect(result.value.progress).toBe(100)
      }
    })

    it('deve preencher apenas REQUIRED e avançar para opcionais no nextPrompt', async () => {
      extractor = createMockExtractor([
        { slot: ReservationSlot.CHECKIN, value: '10/06', confidence: 0.95 },
        { slot: ReservationSlot.CHECKOUT, value: '14/06', confidence: 0.95 },
        { slot: ReservationSlot.GUESTS, value: '2', confidence: 0.95 },
      ])
      useCase = new ProcessSDRMessageUseCase(extractor)

      const result = await useCase.execute({ message: 'data completa', sessionId: 's1', leadId: 'lead-1' })
      expect(result.isOk).toBe(true)
      if (result.isOk) {
        expect(result.value.state.data.completedRequired).toBe(true)
        expect(result.value.nextPrompt).toBe('ask_room_preference')
      }
    })
  })
})
