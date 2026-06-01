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

export async function importContacts(contacts: ImportContactRequest[], groupName: string) {
  let createdCount = 0;
  let updatedCount = 0;const blastContactBatch = await prisma.blastContact.findMany({ where: { phone: { in: contacts.map((contact) => contact.phone) } } });const blastContactMap = new Map<string, any>(blastContactBatch.map((r) => [r.phone, r]));

  for (const contact of contacts) {
    // Normalização do telefone (Remover caracteres não numéricos e garantir DDI)
    let phone = contact.phone.replace(/\D/g, '');
    if (phone.length === 11 && !phone.startsWith('55')) {
      phone = '55' + phone;
    }

    try {
      const existing = await blastContactMap.get(
        phone);


      if (existing) {
        await prisma.blastContact.update({
          where: { phone },
          data: {
            name: contact.name || existing.name,
            email: contact.email || existing.email,
            pousadaName: contact.pousadaName || existing.pousadaName,
            city: contact.city || existing.city,
            state: contact.state || existing.state,
            group: groupName || contact.group || existing.group
          }
        });
        updatedCount++;
      } else {
        await prisma.blastContact.create({
          data: {
            phone,
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
        });
        createdCount++;
      }
    } catch (err) {
      console.error(`❌ [CONTACTS] Erro ao importar contato ${phone}:`, err);
    }
  }

  return { createdCount, updatedCount };
}

export async function getContactsByGroup(group: string) {
  return prisma.blastContact.findMany({
    where: {
      group,
      optedOut: false
    }
  });
}