import { prisma } from '../src/lib/prisma';


/**
 * ZEHLA Canary Seeder
 * Planta "iscas" (Honeypots) no banco de dados para detectar intrusos.
 */

async function seedCanaries() {
  try {

  const properties = await prisma.property.findMany({
    select: { id: true, userId: true, name: true }
  });

  for (const property of properties) {
    // 1. Canary de Reserva (Valor alto, email suspeito)
    await prisma.reservation.upsert({
      where: { code: `CANARY-RES-${property.id.slice(0, 6)}` },
      update: {},
      create: {
        code: `CANARY-RES-${property.id.slice(0, 6)}`,
        propertyId: property.id,
        roomId: (await prisma.room.findFirst({ where: { propertyId: property.id } }))?.id || '',
        guestName: 'Hacker Trap',
        guestEmail: `honeypot@zehla-security.io`,
        guestPhone: '+55 00 00000-0000',
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 86400000),
        nights: 1,
        roomPrice: 9999.99,
        totalAmount: 9999.99,
        status: 'CONFIRMED',
        isCanary: true,
      }
    });

    // 2. Canary de Quarto (Suíte Presidencial inexistente)
    await prisma.room.upsert({
      where: { propertyId_number: { propertyId: property.id, number: '999' } },
      update: {},
      create: {
        propertyId: property.id,
        number: '999',
        name: 'Suíte Admin Confidential',
        type: 'MASTER',
        capacity: 2,
        basePrice: 0.01,
        status: 'MAINTENANCE',
        isCanary: true,
      }
    });
  }

}

seedCanaries()
  .catch(e => {
    console.error('❌ Erro ao plantar Canaries:', e);
    process.exit(1);
  })
  .finally(async () => {
    // @ts-ignore
    await prisma.$disconnect();
  });
