import { prisma } from '../src/lib/prisma';

async function cleanup() {
  console.log('🧹 [CLEANUP] Starting log cleanup...');
  
  // Keep only the last 7 days of agent logs to preserve DB performance
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const deleted = await prisma.agentLog.deleteMany({
    where: {
      createdAt: { lt: sevenDaysAgo }
    }
  });

  console.log(`✅ [CLEANUP] Deleted ${deleted.count} old agent logs.`);

  // Keep only the last 30 days of telemetry to avoid bloat
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const deletedTelemetry = await prisma.businessTelemetry.deleteMany({
    where: {
      date: { lt: thirtyDaysAgo }
    }
  });

  console.log(`✅ [CLEANUP] Deleted ${deletedTelemetry.count} old telemetry records.`);
}

cleanup()
  .catch(e => console.error('❌ [CLEANUP] Error:', e))
  .finally(() => prisma.$disconnect());
