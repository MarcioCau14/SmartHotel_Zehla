import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const terminalLogs = await prisma.cognitiveTerminalLog.count();
  const mlLogs = await prisma.mLInteractionLog.count();
  const zmgMessages = await prisma.zMGMessage.count();
  const memoryNodes = await prisma.memoryNode.count();
  const guestProfiles = await prisma.guestProfile.count();

  console.log('--- PROGRESSO XTRESS ---');
  console.log(`Terminal Logs:  ${terminalLogs}`);
  console.log(`ML Logs:        ${mlLogs}`);
  console.log(`ZMG Messages:   ${zmgMessages}`);
  console.log(`Memory Nodes:   ${memoryNodes}`);
  console.log(`Guest Profiles: ${guestProfiles}`);
  
  if (terminalLogs > 0) {
    const latest = await prisma.cognitiveTerminalLog.findMany({
      orderBy: { timestamp: 'desc' },
      take: 5
    });
    console.log('\n--- ÚLTIMOS LOGS ---');
    latest.forEach(l => console.log(`[${l.component}] ${l.message}`));
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
