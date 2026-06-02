import { AsyncLocalStorage } from 'async_hooks'

export interface TraceContext {
  traceId: string
  tenantId?: string
  userId?: string
}

export const traceStorage = new AsyncLocalStorage<TraceContext>()

export function getTraceContext(): TraceContext | undefined {
  return traceStorage.getStore()
}

export function getTraceId(): string {
  return getTraceContext()?.traceId ?? 'no-trace'
}

export function getTenantId(): string | undefined {
  return getTraceContext()?.tenantId
}

export function generateTraceId(): string {
  const ts = Date.now().toString(36)
  const rand = Math.random().toString(36).substring(2, 8)
  return `${ts}-${rand}`
}
