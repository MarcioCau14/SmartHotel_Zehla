import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Writable } from 'stream'
import { createLogger, resetLoggerForTest } from '../../infrastructure/observability/Logger'

function collectStream(lines: string[]): Writable {
  return new Writable({
    write(chunk: Buffer, _enc: BufferEncoding, cb: () => void) {
      lines.push(chunk.toString().trim())
      cb()
    },
  })
}

describe('Logger Estruturado — Observabilidade', () => {
  beforeEach(() => {
    resetLoggerForTest()
  })

  afterEach(() => {
    resetLoggerForTest()
  })

  it('deve emitir log INFO como JSON estrito', () => {
    const lines: string[] = []
    const log = createLogger({ stream: collectStream(lines) })

    log.info({ acao: 'teste' }, 'hello world')

    expect(lines[0]).toBeDefined()
    const parsed = JSON.parse(lines[0])
    expect(parsed).toHaveProperty('level')
    expect(parsed.level).toBe('info')
    expect(parsed).toHaveProperty('msg')
    expect(parsed.msg).toBe('hello world')
    expect(parsed).toHaveProperty('acao')
    expect(parsed.acao).toBe('teste')
    expect(parsed).toHaveProperty('time')
  })

  it('deve conter tenantId quando injetado', () => {
    const lines: string[] = []
    const log = createLogger({ tenantId: 'tenant-xyz', stream: collectStream(lines) })

    log.info({ recurso: 'lead' }, 'log com tenant')

    const parsed = JSON.parse(lines[0])
    expect(parsed.tenantId).toBe('tenant-xyz')
  })

  it('deve emitir nivel WARN quando chamado', () => {
    const lines: string[] = []
    const log = createLogger({ stream: collectStream(lines) })

    log.warn({ regra: 'handoff', leadId: 'L-1' }, 'Handoff invalido: estado incorreto')

    const parsed = JSON.parse(lines[0])
    expect(parsed.level).toBe('warn')
    expect(parsed.regra).toBe('handoff')
    expect(parsed.leadId).toBe('L-1')
  })

  it('deve serializar erro com stack trace no nivel ERROR', () => {
    const lines: string[] = []
    const log = createLogger({ tenantId: 'tenant-123', stream: collectStream(lines) })

    const error = new Error('Falha no PIX - timeout gateway')
    log.error({ err: error }, 'Falha no PIX')

    const parsed = JSON.parse(lines[0])
    expect(parsed.level).toBe('error')
    expect(parsed.tenantId).toBe('tenant-123')
    expect(parsed).toHaveProperty('err')
    expect(parsed.err.message).toBe('Falha no PIX - timeout gateway')
    expect(parsed.err).toHaveProperty('stack')
  })

  it('deve preservar traceId em logs encadeados', () => {
    const lines: string[] = []
    const log = createLogger({ tenantId: 'tenant-a', traceId: 'trace-42', stream: collectStream(lines) })

    log.info({ etapa: 'inicio' }, 'req iniciada')
    log.warn({ etapa: 'validacao' }, 'campo invalido')

    const first = JSON.parse(lines[0])
    const second = JSON.parse(lines[1])
    expect(first.traceId).toBe('trace-42')
    expect(second.traceId).toBe('trace-42')
    expect(first.tenantId).toBe('tenant-a')
    expect(second.tenantId).toBe('tenant-a')
  })

  it('deve estar em silent mode quando sem stream customizado em test', () => {
    const log = createLogger()
    expect(() => log.info('teste silencioso')).not.toThrow()
  })
})
