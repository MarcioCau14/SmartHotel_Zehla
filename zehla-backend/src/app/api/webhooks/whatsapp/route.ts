import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { orchestrator } from '@/lib/brain/agent-orchestrator'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extrair dados do webhook Evolution API
    const remoteJid = body.data?.key?.remoteJid
    const messageText = body.data?.message?.conversation || body.data?.message?.extendedTextMessage?.text
    const fromMe = body.data?.key?.fromMe
    const pushName = body.data?.pushName

    if (fromMe || !messageText || !remoteJid) {
      return NextResponse.json({ success: true, ignored: true })
    }

    // Extrair número de telefone
    const phone = remoteJid.split('@')[0]

    // Buscar propriedade pelo número de WhatsApp
    const property = await prisma.property.findFirst({
      where: { whatsapp: phone }
    })

    if (!property) {
      console.log('⚠️ Propriedade não encontrada para:', phone)
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 })
    }

    // Salvar mensagem recebida
    await prisma.message.create({
      data: {
        propertyId: property.id,
        phone,
        name: pushName,
        content: messageText,
        direction: 'INBOUND',
        type: 'TEXT',
        status: 'READ'
      }
    })

    // Processar com o orquestrador
    const response = await orchestrator.process({
      propertyId: property.id,
      message: messageText,
      context: { phone, name: pushName }
    })

    // Salvar resposta
    await prisma.message.create({
      data: {
        propertyId: property.id,
        phone,
        content: response.response,
        direction: 'OUTBOUND',
        type: 'TEXT',
        status: 'SENT',
        agentHandled: response.agent
      }
    })

    // Enviar resposta de volta (em produção, chamar Evolution API)
    console.log('📤 Resposta para', phone, ':', response.response.substring(0, 100) + '...')

    return NextResponse.json({
      success: true,
      response: response.response,
      agent: response.agent,
      intent: response.intent
    })
  } catch (error) {
    console.error('❌ Erro no webhook WhatsApp:', error)
    return NextResponse.json({ success: false, error: 'Webhook error' }, { status: 500 })
  }
}
