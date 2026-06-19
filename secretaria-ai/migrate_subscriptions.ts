import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching tenants...');
  const tenants = await prisma.tenant.findMany({
    where: { subscriptionId: null }
  });

  console.log(`Found ${tenants.length} tenants without subscriptions.`);

  for (const tenant of tenants) {
    console.log(`Creating subscription for tenant ${tenant.id} with plan ${tenant.plan}...`);
    
    // Determine amount based on plan
    let amount = 0;
    if (tenant.plan === 'lite') amount = 197;
    else if (tenant.plan === 'pro') amount = 397;
    else if (tenant.plan === 'max') amount = 697;

    const subscription = await prisma.subscription.create({
      data: {
        tenantId: tenant.id,
        planType: tenant.plan,
        status: tenant.status,
        amount: amount,
        paymentMethod: 'pix',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 days
      }
    });

    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { subscriptionId: subscription.id }
    });
    
    console.log(`Updated tenant ${tenant.id} with subscription ${subscription.id}`);
  }

  console.log('Migration complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
