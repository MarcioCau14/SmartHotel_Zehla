import { prisma } from '@/lib/prisma';


/**
 * ZEHLA Warmup Service
 * Implements the 4-week progression plan from Section 3.2 of the Blueprint.
 */
export async function processDailyWarmup() : void {
  try {
  

  const instances = await prisma.blastInstance.findMany({
    where: { 
      status: { in: ['connected', 'paused'] },
      bannedAt: null
    }
  });

  const updates = instances.map(instance => {
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(instance.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    let newLimit = instance.dailyLimit;
    let newStage = instance.warmupStage;

    if (daysSinceCreation <= 3) { newLimit = 100; newStage = 1; }
    else if (daysSinceCreation <= 7) { newLimit = 250; newStage = 1; }
    else if (daysSinceCreation <= 14) { newLimit = 500; newStage = 2; }
    else if (daysSinceCreation <= 21) { newLimit = 1000; newStage = 3; }
    else if (daysSinceCreation <= 28) { newLimit = 2500; newStage = 4; }
    else { newLimit = 10000; newStage = 5; }

    return prisma.blastInstance.update({
      where: { id: instance.id },
      data: {
        dailyLimit: newLimit,
        warmupStage: newStage,
        sentToday: 0,
        sentThisHour: 0
      }
    });
  });

  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }

  
}

/**
 * Reset de hora em hora para o limite por hora (Opcional, se quisermos ser mais granulares)
 */
export async function resetHourlyLimits() : void {
  try {
  await prisma.blastInstance.updateMany({
    data: { sentThisHour: 0 }
  });
}
