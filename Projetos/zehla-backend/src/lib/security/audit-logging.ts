import crypto from 'crypto';

import { prisma } from '@/lib/prisma';


/**
 * ZEHLA AUDIT LOGGING
 * Registro imutável de ações críticas com verificação de integridade.
 */
export async function logAuditEvent(
  tenantId: string,
  action: string,
  amount: number = 0,
  metadata: any = {}
) {
  // Criar um hash do evento para garantir imutabilidade (WORM)
  const payload = JSON.stringify({ tenantId, action, amount, metadata, timestamp: new Date().toISOString() });
  const hash = crypto.createHash('sha256').update(payload).digest('hex');

  return await prisma.financialAudit.create({
    data: {
      tenantId,
      action,
      amount,
      metadata: JSON.stringify(metadata),
      hash,
      source: 'INTERNAL_AUDIT',
    },
  });
}

/**
 * Verifica a integridade de um log de auditoria.
 */
export function verifyAuditIntegrity(log: unknown): boolean {
  try {
  const payload = JSON.stringify({ 
    tenantId: log.tenantId, 
    action: log.action, 
    amount: log.amount, 
    metadata: JSON.parse(log.metadata), 
    timestamp: log.createdAt.toISOString() 
  });
  const hash = crypto.createHash('sha256').update(payload).digest('hex');
  return hash === log.hash;
}
