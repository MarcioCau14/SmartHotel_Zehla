import { NextRequest, NextResponse } from 'next/server'
import { orchestrator } from '@/lib/brain/agent-orchestrator'
import { AgentRequest } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body: AgentRequest = await request.json()

    if (!body.propertyId || !body.message) {
      return NextResponse.json(
        { success: false, error: 'propertyId e message são obrigatórios' },
        { status: 400 }
      )
    }

    const response = await orchestrator.process({
      propertyId: body.propertyId,
      message: body.message,
      context: body.context,
      sessionId: body.sessionId
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ Erro no Recepcionista:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro interno no agente',
        response: 'Desculpe, estou com dificuldades técnicas no momento. Por favor, tente novamente em alguns instantes.'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    agent: 'RECEPTIONIST',
    status: 'online',
    description: 'Atendimento ao hóspede via WhatsApp',
    capabilities: [
      'Responder perguntas sobre a pousada',
      'Auxiliar em reservas',
      'Informar sobre amenities',
      'Transferir para atendimento humano'
    ]
  })
}
