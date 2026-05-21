import { NextRequest, NextResponse } from 'next/server'
import { WhatsappExtractorService } from '@/lib/whatsapp/extractor-service'
import { prisma } from '@/lib/prisma'
import { WhatsappPersonaLearner } from '@/lib/brain/whatsapp-persona-learner'
import { LeadScorer } from '@/lib/brain/lead-scorer'
import { withApiSecurity } from '@/lib/server/with-api-security'
import type { RouteHandler } from '@/lib/server/with-api-security'

const postHandler: RouteHandler = async (req) => {
  try {
    const { instanceName, type, groupJid, propertyId } = await req.json()

    if (!instanceName || !propertyId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    console.log(`🧠 [Secretaria-IA] Iniciando extração ${type} para property ${propertyId}...`)

    let rawContacts: any[] = []

    if (type === 'GROUP' && groupJid) {
      rawContacts = await WhatsappExtractorService.fetchGroupParticipants(instanceName, groupJid)
    } else {
      rawContacts = await WhatsappExtractorService.fetchContacts(instanceName)
    }

    const persona = await WhatsappPersonaLearner.getPersona(propertyId)

    const savedLeads = []
    for (const contact of rawContacts) {
      try {
        const existing = await prisma.lead.findFirst({
          where: { 
            whatsapp: contact.number
          }
        })

        if (!existing) {
          const about = await WhatsappExtractorService.fetchContactAbout(instanceName, contact.number)
          
          const analysis = await LeadScorer.scoreLead(contact.name || '', about)

          const lead = await prisma.lead.create({
            data: {
              name: contact.name || 'Extraído via WA',
              whatsapp: contact.number,
              phone: contact.number,
              propertyId: propertyId !== 'cm1...' ? propertyId : undefined,
              status: analysis.score > 70 ? 'QUALIFIED' : 'PROSPECT',
              source: 'WHATSAPP_EXTRACT',
              category: analysis.category,
              score: analysis.score,
              painPoints: analysis.painPoints.join(', '),
              notes: `Extraído via Secretaria-IA. Perfil: ${about}. Analise: ${analysis.reasoning}. Estilo Tom de Voz: ${persona.tone}`,
            }
          })
          savedLeads.push(lead)
          
          await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000))
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

const getHandler: RouteHandler = async (req) => {
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

export const POST = withApiSecurity(postHandler);
export const GET = withApiSecurity(getHandler);
