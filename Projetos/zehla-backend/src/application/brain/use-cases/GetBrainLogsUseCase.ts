import { Result } from '../../../shared/Result'

export interface LogEntryDTO {
  readonly id: string
  readonly timestamp: string
  readonly level: 'info' | 'warn' | 'error' | 'debug'
  readonly agent: string
  readonly message: string
  readonly details?: string
}

export interface IBrainLogRepositoryPort {
  listarLogs(propertyId: string, limit?: number): Promise<Result<LogEntryDTO[], Error>>
  registrarLog(entry: LogEntryDTO): Promise<Result<LogEntryDTO, Error>>
}

export class GetBrainLogsUseCase {
  constructor(private readonly repo: IBrainLogRepositoryPort) {}

  async execute(propertyId: string, limit?: number): Promise<Result<LogEntryDTO[], Error>> {
    return this.repo.listarLogs(propertyId, limit)
  }
}
