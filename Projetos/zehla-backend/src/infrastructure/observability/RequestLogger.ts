import { NextRequest, NextResponse } from 'next/server'
import { traceStorage, generateTraceId, getTraceId, getTenantId } from './TraceContext'
import { createLogger } from './Logger'

export function withRequestLogging(
  handler: (req: NextRequest, context: { params: Promise<Record<string, string>> }) => Promise<NextResponse>,
) {
  return async (req: NextRequest, context: { params: Promise<Record<string, string>> }) => {
    const traceId = req.headers.get('x-trace-id') ?? generateTraceId()
    const tenantId = req.headers.get('x-tenant-id') ?? undefined

    return traceStorage.run({ traceId, tenantId }, async () => {
      const log = createLogger(tenantId, traceId)
      const start = performance.now()
      const method = req.method
      const url = req.nextUrl.pathname

      log.info({ method, url }, `→ ${method} ${url}`)

      try {
        const response = await handler(req, context)
        const duration = ((performance.now() - start) / 1000).toFixed(3)

        if (!response.ok) {
          log.warn({ method, url, status: response.status, duration }, `← ${method} ${url} ${response.status}`)
        } else {
          log.info({ method, url, status: response.status, duration }, `← ${method} ${url} ${response.status}`)
        }

        return response
      } catch (error) {
        const duration = ((performance.now() - start) / 1000).toFixed(3)
        log.error(
          { err: error as Error, method, url, duration },
          `✖ ${method} ${url} — uncaught`,
        )
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
      }
    })
  }
}

export { getTraceId, getTenantId }
