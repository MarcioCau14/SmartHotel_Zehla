import fs from 'fs';
import path from 'path';


/**
 * ZEHLA Anti-Recycling Cross-Reference Utility
 * Checks for potential trial abuse by crossing data with secretaria-ai leads.
 */
export async function checkSecretariaLeads(email: string, phone: string): Promise<{ match: boolean; isAbuse?: boolean; reason?: string }> {
  const CSV_PATH = '/Users/marciocau/secretaria-ai/backend/outbox/LEADS_POUSADAS_PRAIA_DO_ROSA.csv';

  try {
    // 1. Check in ZEHLA Database first (for better accuracy)
    const { prisma } = await import('@/lib/prisma');
    const existingLead = await prisma.lead.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          { phone: phone.trim() }
        ]
      }
    });

    if (existingLead) {
       const isAbuse = existingLead.status === 'TRIAL_STARTED' || existingLead.status === 'CONVERTED' || existingLead.status === 'BLACKLISTED';
       return { 
         match: true, 
         isAbuse, 
         reason: isAbuse ? 'Histórico de uso de trial detectado no banco central.' : 'Lead qualificado encontrado na base Secretaria-IA.' 
       };
    }

    // 2. Fallback to CSV (legacy leads)
    if (!fs.existsSync(CSV_PATH)) return { match: false };

    const content = fs.readFileSync(CSV_PATH, 'utf-8');
    const lines = content.split('\n');

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.replace(/\D/g, '');

    for (const line of lines) {
      if (!line.trim()) continue;
      const normalizedLine = line.toLowerCase();
      
      const hasEmailMatch = normalizedEmail && normalizedLine.includes(normalizedEmail);
      const hasPhoneMatch = normalizedPhone && normalizedPhone.length > 8 && (normalizedLine.replace(/\D/g, '').includes(normalizedPhone));

      if (hasEmailMatch || hasPhoneMatch) {
        // Simple logic: if the line contains "test" or "trial", we consider it abuse
        const isAbuse = normalizedLine.includes('teste') || normalizedLine.includes('trial');
        return { 
          match: true, 
          isAbuse, 
          reason: 'Contato identificado na base de prospecção regional.' 
        };
      }
    }

    return { match: false };
  } catch (error) {
    console.error('[CROSS-REF] Error checking secretaria leads:', error);
    return { match: false };
  }
}
