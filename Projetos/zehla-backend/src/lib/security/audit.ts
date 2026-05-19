import crypto from 'node:crypto';

import { prisma } from '@/lib/prisma';

import { scanPII } from './pii-sanitizer';


export type SecuritySeverity = 'INFO' | 'WARN' | 'ALERT' | 'CRITICAL';

interface AuditLogParams {
  tenantId: string;
  userId?: string;
  action: string;
  severity: SecuritySeverity;
  metadata?: unknown;
  resource?: string;
}

/**
 * ZEHLA Audit Engine
 * Grava eventos de segurança e auditoria seguindo o protocolo de imutabilidade.
 */
export async function logSecurityEvent(params: AuditLogParams) : void {
  const { sanitized: safeMetadata } = scanPII(params.metadata);
  
  try {
    await prisma.securityAlert.create({
      data: {
        tenantId: params.tenantId,
        alertType: params.action,
        severity: params.severity,
        metadata: JSON.stringify({
          ...safeMetadata,
          resource: params.resource,
          userId: params.userId,
          timestamp: new Date().toISOString()
        })
      }
    });

    if (params.severity === 'CRITICAL' || params.severity === 'ALERT') {
      console.error(`🚨 [SECURITY ${params.severity}] ${params.action} - Tenant: ${params.tenantId}`);
      // Aqui poderíamos disparar um webhook para o Telegram/Slack de monitoramento
    }
  } catch (error) {
    console.error('[AuditEngine] Failed to log security event:', error);
  }
}

/**
 * ZEHLA Financial Bunker (WORM)
 * Implementa o encadeamento de hash para garantir que o histórico financeiro não foi alterado.
 */
export async function logFinancialAction(params: {
  try {
  tenantId: string;
  action: string;
  amount: number;
  source: string;
  externalId?: string;
  metadata?: unknown;
}) {
  // 1. Buscar o último registro para pegar o hash anterior (Hash Chain)
  const lastAudit = await prisma.financialAudit.findFirst({
    where: { tenantId: params.tenantId },
    orderBy: { createdAt: 'desc' }
  });

  const previousHash = lastAudit?.hash || 'ZEHLA_GENESIS_BLOCK';

  // 2. Calcular o novo hash do bloco atual
  const currentBlockData = JSON.stringify({
    tenantId: params.tenantId,
    action: params.action,
    amount: params.amount,
    source: params.source,
    externalId: params.externalId,
    previousHash
  });

  const hash = crypto
    .createHmac('sha256', process.env.ENCRYPTION_KEY || 'zehla-secret')
    .update(currentBlockData)
    .digest('hex');

  // 3. Persistir no Bunker (WORM)
  return await prisma.financialAudit.create({
    data: {
      tenantId: params.tenantId,
      action: params.action,
      amount: params.amount,
      source: params.source,
      externalId: params.externalId,
      metadata: JSON.stringify(params.metadata),
      hash
    }
  });
}

/**
 * Verifica a integridade da corrente financeira de um tenant.
 */
export async function verifyFinancialIntegrity(tenantId: string): Promise<boolean> {
  try {
  const audits = await prisma.financialAudit.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'asc' }
  });

  let runningHash = 'ZEHLA_GENESIS_BLOCK';

  for (const audit of audits) {
    const data = JSON.stringify({
      tenantId: audit.tenantId,
      action: audit.action,
      amount: audit.amount,
      source: audit.source,
      externalId: audit.externalId,
      previousHash: runningHash
    });

    const calculatedHash = crypto
      .createHmac('sha256', process.env.ENCRYPTION_KEY || 'zehla-secret')
      .update(data)
      .digest('hex');

    if (calculatedHash !== audit.hash) {
      console.error(`🚨 [INTEGRITY ALERT] Quebra na corrente financeira detectada no registro ${audit.id}`);
      return false;
    }

    runningHash = audit.hash;
  }

  return true;
}
