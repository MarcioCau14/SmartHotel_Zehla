import { prisma } from '../src/lib/prisma'

async function testEmailTracking() {
  console.log('🧪 Iniciando teste de Email Tracking...')

  // Pegar um lead de teste (ou criar um)
  let lead = await prisma.lead.findFirst({
    where: { source: 'WHATSAPP_EXTRACT' }
  })

  if (!lead) {
    lead = await prisma.lead.create({
      data: {
        name: 'Lead de Teste Tracking',
        phone: '11999999999',
        source: 'WHATSAPP_EXTRACT',
        status: 'PROSPECT'
      }
    })
  }

  console.log(`👤 Lead selecionado: ${lead.name} (ID: ${lead.id})`)

  // Simular abertura de email chamando o endpoint internamente (ou criando o log direto)
  // Como estamos testando o DB, vamos criar o log
  const tracking = await prisma.emailTracking.create({
    data: {
      leadId: lead.id,
      campaignId: 'campanha-teste-001',
      ip: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Test Agent)'
    }
  })

  console.log(`✅ Evento de tracking criado com sucesso! ID: ${tracking.id}`)

  // Verificar se o count no lead funciona
  const updatedLead = await prisma.lead.findUnique({
    where: { id: lead.id },
    include: {
      _count: {
        select: { emailTracking: true }
      }
    }
  })

  console.log(`📊 Total de aberturas registradas para o lead: ${updatedLead?._count.emailTracking}`)
  
  if (updatedLead?._count.emailTracking && updatedLead._count.emailTracking > 0) {
    console.log('🚀 TESTE BEM SUCEDIDO!')
  } else {
    console.log('❌ TESTE FALHOU: O contador não atualizou.')
  }
}

testEmailTracking().catch(console.error)
