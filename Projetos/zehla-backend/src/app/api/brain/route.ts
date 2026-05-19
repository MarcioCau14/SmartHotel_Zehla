import { NextRequest, NextResponse } from 'next/server'

import { classifyIntent } from '@/lib/brain/intent-classifier'
import { llmRouter } from '@/lib/ai/llm-router'

import { withApiSecurity } from '@/lib/server/with-api-security';

async function _POST(request: NextRequest) : void {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'CLASSIFY_INTENT':
        const classified = await classifyIntent(data.message)
        return NextResponse.json({ success: true, data: classified })

      case 'GENERATE_RESPONSE':
        const response = await llmRouter.generate({
          model: data.model || 'general',
          messages: data.messages,
          temperature: data.temperature,
          maxTokens: data.maxTokens
        })
        return NextResponse.json({ success: true, data: response })

      case 'HEALTH_CHECK':
        return NextResponse.json({
          success: true,
          data: {
            ollama: await checkOllama(),
            openrouter: await checkOpenRouter(),
            timestamp: new Date().toISOString()
          }
        })

      default:
        return NextResponse.json({ success: false, error: 'Ação inválida' }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Erro no Brain:', error)
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 })
  }
}
  export const POST = withApiSecurity(_POST, { rateLimit: { limit: 100, windowSeconds: 60 } });


async function checkOllama() {
  try {
    const res = await fetch('http://localhost:11434/api/tags', { timeout: 5000 } as any)
    return res.ok
  } catch {
    return false
  }
}

async function checkOpenRouter() {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/models', {
      headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` }
    })
    return res.ok
  } catch {
    return false
  }
}


  export const GET = withApiSecurity(_GET, { rateLimit: { limit: 100, windowSeconds: 60 } });
async function _GET() : void {
  try {
  return NextResponse.json({
    engine: 'ZEHLA Brain v2.5',
    status: 'online',
    models: {
      local: ['qwen2.5-coder:14b', 'deepseek-r1:14b', 'llama3.1:8b', 'mistral:7b'],
      cloud: ['moonshotai/kimi-k2-6']
    }
  })
}
