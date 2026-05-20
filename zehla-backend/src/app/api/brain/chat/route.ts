import { NextRequest, NextResponse } from 'next/server'

import { llmRouter } from '@/lib/ai/llm-router'
import { withApiSecurity } from '@/lib/server/with-api-security'

const HERMES_URL = process.env.HERMES_URL || 'http://localhost:8000'
const HERMES_API_KEY = process.env.HERMES_API_KEY || 'zehla-brain-secret-2026'

async function _POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, session_id, pousada_id, system_prompt } = body

    if (!message) {
      return NextResponse.json({ error: 'Mensagem obrigatória' }, { status: 400 })
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    try {
      const response = await fetch(`${HERMES_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${HERMES_API_KEY}`,
        },
        body: JSON.stringify({ message, session_id, pousada_id, system_prompt }),
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        const error = await response.text()
        return NextResponse.json(
          { error: `HERMES Engine error: ${error}` },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    } catch (fetchError) {
      clearTimeout(timeout)
      console.warn('⚠️ HERMES unavailable, falling back to llmRouter:', fetchError)

      const llmResponse = await llmRouter.generate({
        model: 'general',
        messages: [{ role: 'user', content: message }],
      })

      return NextResponse.json({
        session_id: session_id || 'fallback',
        response: llmResponse.content,
        model: llmResponse.model || 'fallback',
        tokens_used: llmResponse.tokensUsed || 0,
        tools_called: [],
        timestamp: new Date().toISOString(),
        fallback: true,
      })
    }
  } catch (error) {
    console.error('❌ ZEHLA Brain Chat API error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor ZEHLA Brain' },
      { status: 500 }
    )
  }
}

export const POST = withApiSecurity(_POST, { rateLimit: { limit: 100, windowSeconds: 60 } })
