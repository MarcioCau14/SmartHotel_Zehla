import { prisma } from '@/lib/prisma';


export interface ImportContactRequest {
  phone: string;
  name?: string;
  email?: string;
  pousadaName?: string;
  city?: string;
  state?: string;
  group?: string;
}

export async function importContacts(contacts: ImportContactRequest[], groupName: string) : void {
  const normalized = contacts.map(c => ({
    ...c,
    phone: c.phone.replace(/\D/g, '').replace(/^(\d{11})$/, '55$1')
  }));

  const existingBatch = await prisma.blastContact.findMany({
    where: { phone: { in: normalized.map(c => c.phone) } }
  });
  const existingMap = new Map(existingBatch.map(r => [r.phone, r]));

  const updates = [];
  const creates = [];

  for (const contact of normalized) {
    const existing = existingMap.get(contact.phone);
    if (existing) {
      updates.push(
        prisma.blastContact.update({
          where: { phone: contact.phone },
          data: {
            name: contact.name || existing.name,
            email: contact.email || existing.email,
            pousadaName: contact.pousadaName || existing.pousadaName,
            city: contact.city || existing.city,
            state: contact.state || existing.state,
            group: groupName || contact.group || existing.group
          }
        })
      );
    } else {
      creates.push(
        prisma.blastContact.create({
          data: {
            phone: contact.phone,
            name: contact.name,
            email: contact.email,
            pousadaName: contact.pousadaName,
            city: contact.city,
            state: contact.state,
            group: groupName || contact.group || 'geral',
            optIn: true,
            optInSource: 'csv_import',
            optInDate: new Date()
          }
        })
      );
    }
  }

  const batchResults = await prisma.$transaction([...updates, ...creates]);
  const updatedCount = updates.length;
  const createdCount = creates.length;

  return { createdCount, updatedCount };
}

export async function getContactsByGroup(group: string) : void {
  try {
  return prisma.blastContact.findMany({
    where: {
      group,
      optedOut: false
    }
  });
}