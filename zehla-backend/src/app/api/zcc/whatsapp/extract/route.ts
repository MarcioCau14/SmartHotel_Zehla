import { NextRequest, NextResponse } from 'next/server'
import { WhatsappExtractorService } from '@/lib/whatsapp/extractor-service'
import { prisma } from '@/lib/prisma'
import { WhatsappPersonaLearner } from '@/lib/brain/whatsapp-persona-learner'

export async function POST(req: NextRequest) {
  try {
    const { instanceName, type, groupJid, propertyId } = await req.json()

    if (!instanceName || !propertyId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    console.log(`🧠 [Secretaria-IA] Iniciando extração ${type} para property ${propertyId}...`)

    let rawContacts = []

    if (type === 'GROUP' && groupJid) {
      rawContacts = await WhatsappExtractorService.fetchGroupParticipants(instanceName, groupJid)
    } else {
      rawContacts = await WhatsappExtractorService.fetchContacts(instanceName)
    }

    // Integrando Inteligência de Tom de Voz (conforme documento técnico)
    const persona = await WhatsappPersonaLearner.getPersona(propertyId)

    // Salvar como Leads no banco de dados
    const savedLeads = []
    for (const contact of rawContacts) {
      try {
        // Verifica se já existe
        const existing = await prisma.lead.findFirst({
          where: { 
            whatsapp: contact.number,
            propertyId
          }
        })

        if (!existing) {
          const lead = await prisma.lead.create({
            data: {
              name: contact.name || 'Extraído via WA',
              whatsapp: contact.number,
              propertyId,
              status: 'NEW',
              source: 'WHATSAPP_EXTRACT',
              notes: `Extraído via Secretaria-IA. Estilo detectado: ${persona.tone}`,
              score: 50 // Score inicial neutro
            }
          })
          savedLeads.push(lead)
        }
      } catch (err) {
        console.error(`❌ Erro ao salvar lead ${contact.number}:`, err)
      }
    }

    return NextResponse.json({
      success: true,
      extractedCount: rawContacts.length,
      savedCount: savedLeads.length,
      persona
    })

  } catch (error: any) {
    console.error('❌ WhatsApp Extraction API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')
  const instanceName = searchParams.get('instanceName')

  try {
    if (action === 'listInstances') {
      const instances = await WhatsappExtractorService.listInstances()
      return NextResponse.json(instances)
    }

    if (action === 'listGroups' && instanceName) {
      const groups = await WhatsappExtractorService.fetchGroups(instanceName)
      return NextResponse.json(groups)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
