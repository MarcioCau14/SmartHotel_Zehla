import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

async function cleanSweep() {
  

  try {
    // Ordem de deleção respeitando as chaves estrangeiras
    
    await prisma.systemLog.deleteMany({});
    await prisma.securityAlert.deleteMany({});
    await prisma.securityIncident.deleteMany({});
    await prisma.zeladorAction.deleteMany({});

    
    await prisma.message.deleteMany({});
    await prisma.agentLog.deleteMany({});

    ...');
    await prisma.invoiceItem.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.payment.deleteMany({});

    
    await prisma.reservation.deleteMany({});
    await prisma.pricingRule.deleteMany({});

    ...');
    await prisma.room.deleteMany({});
    await prisma.service.deleteMany({});

    
    await prisma.emailTracking.deleteMany({});
    await prisma.lead.deleteMany({});

    ...');
    await prisma.property.deleteMany({});

    
  } catch (error) {
    console.error('❌ [ZEHLA] Erro durante a limpeza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanSweep();
