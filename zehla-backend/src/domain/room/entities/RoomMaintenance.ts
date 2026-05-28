import { Result } from '../../shared/Result'
import { MaintenanceStatus } from '../enums'
import { RoomDateRange } from '../value-objects/RoomDateRange'

export interface RoomMaintenanceData {
  id: string
  roomId: string
  reason: string
  description?: string
  period: RoomDateRange
  status: MaintenanceStatus
  createdAt: Date
  completedAt?: Date
}

export class RoomMaintenance {
  private constructor(private data: RoomMaintenanceData) {}

  static create(props: {
    id: string
    roomId: string
    reason: string
    description?: string
    period: RoomDateRange
  }): Result<RoomMaintenance, string> {
    if (!props.id) return Result.fail('ID da manutenção é obrigatório')
    if (!props.roomId) return Result.fail('ID do quarto é obrigatório')
    if (!props.reason || props.reason.trim().length < 3) {
      return Result.fail('Motivo da manutenção deve ter no mínimo 3 caracteres')
    }
    if (props.period.nights < 1) {
      return Result.fail('Período de manutenção deve ter no mínimo 1 dia')
    }

    return Result.ok(
      new RoomMaintenance({
        ...props,
        status: MaintenanceStatus.SCHEDULED,
        createdAt: new Date(),
      })
    )
  }

  get id(): string { return this.data.id }
  get roomId(): string { return this.data.roomId }
  get reason(): string { return this.data.reason }
  get description(): string | undefined { return this.data.description }
  get period(): RoomDateRange { return this.data.period }
  get status(): MaintenanceStatus { return this.data.status }
  get createdAt(): Date { return this.data.createdAt }
  get completedAt(): Date | undefined { return this.data.completedAt }

  start(): Result<void, string> {
    if (this.data.status !== MaintenanceStatus.SCHEDULED) {
      return Result.fail(`Manutenção não pode ser iniciada com status ${this.data.status}`)
    }
    this.data.status = MaintenanceStatus.IN_PROGRESS
    return Result.ok(undefined)
  }

  complete(): Result<void, string> {
    if (this.data.status !== MaintenanceStatus.IN_PROGRESS) {
      return Result.fail(`Apenas manutenção em andamento pode ser concluída (status atual: ${this.data.status})`)
    }
    this.data.status = MaintenanceStatus.COMPLETED
    this.data.completedAt = new Date()
    return Result.ok(undefined)
  }

  cancel(): Result<void, string> {
    if (
      this.data.status === MaintenanceStatus.COMPLETED ||
      this.data.status === MaintenanceStatus.CANCELLED
    ) {
      return Result.fail(`Manutenção já está finalizada (${this.data.status})`)
    }
    this.data.status = MaintenanceStatus.CANCELLED
    return Result.ok(undefined)
  }

  isActiveOn(date: Date): boolean {
    if (
      this.data.status === MaintenanceStatus.CANCELLED ||
      this.data.status === MaintenanceStatus.COMPLETED
    ) {
      return false
    }
    return this.data.period.contains(date)
  }

  toJSON() {
    return {
      id: this.data.id,
      roomId: this.data.roomId,
      reason: this.data.reason,
      description: this.data.description,
      period: this.data.period.toJSON(),
      status: this.data.status,
      createdAt: this.data.createdAt.toISOString(),
      completedAt: this.data.completedAt?.toISOString(),
    }
  }
}
