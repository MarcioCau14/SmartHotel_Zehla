import { Result } from '../../../domain/shared/Result'
import { IReservationRepository } from '../ports/IReservationRepository'
import { IRoomRepository } from '../ports/IRoomRepository'
import { IEventBus } from '../ports/IEventBus'
import { RoomStatus } from '../../../domain/room/enums'
import { IChecklistPort } from '../../operacional/ports/IChecklistPort'

export interface CheckOutInput {
  reservationId: string
}

export interface CheckOutOutput {
  reservationId: string
  roomStatus: string
}

export class CheckOutUseCase {
  constructor(
    private reservationRepo: IReservationRepository,
    private roomRepo: IRoomRepository,
    private eventBus: IEventBus,
    private checklistPort?: IChecklistPort
  ) {}

  async execute(input: CheckOutInput): Promise<Result<CheckOutOutput, string>> {
    const reservation = await this.reservationRepo.findById(input.reservationId)
    if (!reservation) {
      return Result.fail('Reserva não encontrada')
    }

    const checkOutResult = reservation.checkOut()
    if (checkOutResult.isFail) {
      return Result.fail(checkOutResult.error)
    }

    await this.reservationRepo.update(reservation)
    await this.roomRepo.updateStatus(reservation.roomId, RoomStatus.CLEANING)
    await this.eventBus.publishMany(reservation.events)
    reservation.clearEvents()

    if (this.checklistPort) {
      try {
        const room = await this.roomRepo.findById(reservation.roomId)
        const roomName = room ? (room.name || room.number) : reservation.roomId

        const checklistResult = await this.checklistPort.criarChecklist({
          propriedadeId: reservation.propertyId,
          nome: `Limpeza do Quarto ${roomName}`,
          tipoTrigger: 'checkout',
          ativoId: reservation.roomId,
          itens: [
            { itemId: 'item_1', descricao: 'Trocar lençóis e fronhas', obrigatorio: true, concluido: false },
            { itemId: 'item_2', descricao: 'Limpar banheiro', obrigatorio: true, concluido: false },
            { itemId: 'item_3', descricao: 'Trocar toalhas', obrigatorio: true, concluido: false },
            { itemId: 'item_4', descricao: 'Repor frigobar', obrigatorio: false, concluido: false },
            { itemId: 'item_5', descricao: 'Varrer e passar pano', obrigatorio: true, concluido: false },
          ]
        })

        if (checklistResult.isFail) {
          console.error('[CheckOutUseCase] Falha ao criar checklist automático:', checklistResult.error)
        }
      } catch (err) {
        console.error('[CheckOutUseCase] Erro na criação de checklist automático:', err)
      }
    }

    return Result.ok({
      reservationId: reservation.id,
      roomStatus: 'CLEANING',
    })
  }
}

