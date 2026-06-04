export interface LogEntry {
  readonly id: string
  readonly timestamp: string
  readonly level: 'info' | 'warn' | 'error' | 'debug'
  readonly agent: string
  readonly message: string
  readonly details?: string
}

export interface AuditEntry {
  readonly id: string
  readonly data: string
  readonly agente: string
  readonly tipo: string
  readonly score: number
  readonly status: 'pass' | 'fail' | 'warning'
  readonly violacoes: ReadonlyArray<string>
}

export const NIVEL_COR: Record<LogEntry['level'], string> = {
  info: 'text-blue-400',
  warn: 'text-amber-400',
  error: 'text-red-400',
  debug: 'text-slate-500',
}

export const AGENTE_COR: Record<string, string> = {
  HERMES: 'text-cyan-400',
  ATENA: 'text-violet-400',
  FARMER: 'text-emerald-400',
  AUDITOR: 'text-rose-400',
  SDR: 'text-amber-400',
  ZAOS: 'text-blue-400',
}
