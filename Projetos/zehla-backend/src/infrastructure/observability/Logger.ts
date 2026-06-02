import pino from 'pino'
import { Writable } from 'stream'

let loggerInstance: pino.Logger | null = null

export interface LoggerOptions {
  tenantId?: string
  traceId?: string
  stream?: Writable
}

export function createLogger(tenantId?: string, traceId?: string): pino.Logger
export function createLogger(options?: LoggerOptions): pino.Logger
export function createLogger(tenantOrOptions?: string | LoggerOptions, traceId?: string): pino.Logger {
  const isProduction = process.env.NODE_ENV === 'production'
  const isTest = process.env.NODE_ENV === 'test' || process.env.VITEST === 'true'

  let tenantId: string | undefined
  let customStream: Writable | undefined

  if (typeof tenantOrOptions === 'object') {
    tenantId = tenantOrOptions.tenantId
    traceId = tenantOrOptions.traceId ?? traceId
    customStream = tenantOrOptions.stream
  } else {
    tenantId = tenantOrOptions
  }

  if (!loggerInstance || customStream) {
    const pinoOptions: pino.LoggerOptions = {
      level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
      serializers: {
        err: pino.stdSerializers.err,
        error: pino.stdSerializers.err,
      },
      base: undefined,
      formatters: {
        level(label) {
          return { level: label }
        },
      },
    }

    if (customStream) {
      loggerInstance = pino(pinoOptions, customStream)
    } else if (isTest) {
      loggerInstance = pino({ ...pinoOptions, level: 'silent' })
    } else if (!isProduction) {
      loggerInstance = pino({
        ...pinoOptions,
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:standard' },
        },
      })
    } else {
      loggerInstance = pino(pinoOptions)
    }
  }

  const bindings: Record<string, string> = {}
  if (tenantId) bindings.tenantId = tenantId
  if (traceId) bindings.traceId = traceId

  return bindings.tenantId || bindings.traceId ? loggerInstance.child(bindings) : loggerInstance
}

export function resetLoggerForTest(): void {
  loggerInstance = null
}
