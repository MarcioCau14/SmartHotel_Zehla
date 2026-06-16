import { describe, it, expect, vi } from 'vitest'
import { CheckOutUseCase } from '../../application/reservation/use-cases/CheckOutUseCase'
import { Result } from '../../domain/shared/Result'
import { RoomStatus } from '../../domain/room/enums'

describe('CheckOutUseCase — Automatic Cleaning Checklist', () => {
  it('should conclusion checkout and trigger automatic checklist creation', async () => {
    // 1. Mocks
    const mockReservation = {
      id: 'res-123',
      roomId: 'room-abc',
      propertyId: 'prop-xyz',
      events: [],
      checkOut: vi.fn().mockReturnValue(Result.ok(undefined)),
      clearEvents: vi.fn(),
    }

    const mockReservationRepo = {
      findById: vi.fn().mockResolvedValue(mockReservation),
      update: vi.fn().mockResolvedValue(undefined),
    }

    const mockRoom = {
      id: 'room-abc',
      number: '101',
      name: 'Suíte Luxo 101',
    }

    const mockRoomRepo = {
      findById: vi.fn().mockResolvedValue(mockRoom),
      findByProperty: vi.fn(),
      findAvailable: vi.fn(),
      updateStatus: vi.fn().mockResolvedValue(undefined),
    }

    const mockEventBus = {
      publishMany: vi.fn().mockResolvedValue(undefined),
    }

    const mockChecklistPort = {
      criarChecklist: vi.fn().mockResolvedValue(Result.ok({})),
      buscarChecklistPorId: vi.fn(),
      listarPorAtivo: vi.fn(),
      listarPorTrigger: vi.fn(),
      listarPendentesPorAtivo: vi.fn(),
      atualizarChecklist: vi.fn(),
    }

    const useCase = new CheckOutUseCase(
      mockReservationRepo as any,
      mockRoomRepo as any,
      mockEventBus as any,
      mockChecklistPort as any
    )

    // 2. Executar
    const result = await useCase.execute({ reservationId: 'res-123' })

    // 3. Asserções
    expect(result.isOk).toBe(true)
    expect(mockRoomRepo.updateStatus).toHaveBeenCalledWith('room-abc', RoomStatus.CLEANING)
    expect(mockChecklistPort.criarChecklist).toHaveBeenCalledWith(
      expect.objectContaining({
        propriedadeId: 'prop-xyz',
        nome: 'Limpeza do Quarto Suíte Luxo 101',
        tipoTrigger: 'checkout',
        ativoId: 'room-abc',
        itens: expect.arrayContaining([
          expect.objectContaining({ descricao: 'Trocar lençóis e fronhas', obrigatorio: true }),
          expect.objectContaining({ descricao: 'Limpar banheiro', obrigatorio: true }),
          expect.objectContaining({ descricao: 'Trocar toalhas', obrigatorio: true }),
          expect.objectContaining({ descricao: 'Repor frigobar', obrigatorio: false }),
          expect.objectContaining({ descricao: 'Varrer e passar pano', obrigatorio: true }),
        ]),
      })
    )
  })
})
