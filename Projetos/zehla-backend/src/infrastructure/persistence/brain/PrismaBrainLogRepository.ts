import { prisma } from '@/lib/prisma'
import { GetBrainLogsUseCase, type LogEntryDTO, type IBrainLogRepositoryPort } from '@/application/brain/use-cases/GetBrainLogsUseCase'
import { Result } from '../../../shared/Result'

export class PrismaBrainLogRepository implements IBrainLogRepositoryPort {
  async listarLogs(propertyId: string, limit: number = 50): Promise<Result<LogEntryDTO[], Error>> {
    try {
      const rows = await prisma.agentLog.findMany({
        where: { propertyId },
        orderBy: { createdAt: 'desc' },
        take: Math.min(limit, 200),
      })

      const logs: LogEntryDTO[] = rows.map((row) => ({
        id: row.id,
        timestamp: row.createdAt.toISOString(),
        level: row.status === 'ERROR' ? 'error' : row.status === 'WARN' ? 'warn' : 'info' as const,
        agent: row.agentName,
        message: `${row.action}${row.intent ? ` — ${row.intent}` : ''}`,
        details: row.output ?? undefined,
      }))

      return Result.ok(logs)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      return Result.fail(new Error(`Falha ao buscar logs: ${msg}`))
    }
  }

  async registrarLog(entry: LogEntryDTO): Promise<Result<LogEntryDTO, Error>> {
    try {
      const row = await prisma.agentLog.create({
        data: {
          agentName: entry.agent,
          action: entry.message,
          status: entry.level.toUpperCase(),
          propertyId: 'default',
          tokensUsed: 0,
          cost: 0,
          duration: 0,
        },
      })

      return Result.ok(
        Object.freeze({
          id: row.id,
          timestamp: row.createdAt.toISOString(),
          level: entry.level,
          agent: row.agentName,
          message: row.action,
          details: entry.details,
        }),
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      return Result.fail(new Error(`Falha ao registrar log: ${msg}`))
    }
  }
}
