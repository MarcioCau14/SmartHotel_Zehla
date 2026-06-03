import { describe, it, expect } from 'vitest'
import {
  SlotFillingState,
  ReservationSlot,
  ALL_SLOTS,
  REQUIRED_SLOTS,
} from '../../domain/crm/models/SDRSlotFilling'

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
})
