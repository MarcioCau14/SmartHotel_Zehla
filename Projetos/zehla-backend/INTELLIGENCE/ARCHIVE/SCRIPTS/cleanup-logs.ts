import { prisma } from '../src/lib/prisma';


async function cleanup() {
  
  
  // Keep only the last 7 days of agent logs to preserve DB performance
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const deleted = await prisma.agentLog.deleteMany({
    where: {
      createdAt: { lt: sevenDaysAgo }
    }
  });

  

  // Keep only the last 30 days of telemetry to avoid bloat
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const deletedTelemetry = await prisma.businessTelemetry.deleteMany({
    where: {
      date: { lt: thirtyDaysAgo }
    }
  });

  
}

cleanup()
  .catch(e => console.error('❌ [CLEANUP] Error:', e))
  .finally(() => prisma.$disconnect());
