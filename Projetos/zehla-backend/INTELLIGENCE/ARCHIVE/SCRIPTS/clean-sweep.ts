import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanSweep() {
  console.log('🧹 [ZEHLA] Iniciando limpeza profunda do banco de dados...');

  try {
    // Ordem de deleção respeitando as chaves estrangeiras
    console.log('- Deletando Logs do Sistema e Alertas...');
    await prisma.systemLog.deleteMany({});
    await prisma.securityAlert.deleteMany({});
    await prisma.securityIncident.deleteMany({});
    await prisma.zeladorAction.deleteMany({});

    console.log('- Deletando Mensagens e Logs de Agentes...');
    await prisma.message.deleteMany({});
    await prisma.agentLog.deleteMany({});

    console.log('- Deletando Financeiro (Invoices e Payments)...');
    await prisma.invoiceItem.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.payment.deleteMany({});

    console.log('- Deletando Reservas e Regras de Preço...');
    await prisma.reservation.deleteMany({});
    await prisma.pricingRule.deleteMany({});

    console.log('- Deletando Inventário (Quartos e Serviços)...');
    await prisma.room.deleteMany({});
    await prisma.service.deleteMany({});

    console.log('- Deletando Leads e Tracking...');
    await prisma.emailTracking.deleteMany({});
    await prisma.lead.deleteMany({});

    console.log('- Deletando Propriedades (Mocks)...');
    await prisma.property.deleteMany({});

    console.log('✅ [ZEHLA] Limpeza concluída com sucesso. O banco está pronto para novos testes.');
  } catch (error) {
    console.error('❌ [ZEHLA] Erro durante a limpeza:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanSweep();
