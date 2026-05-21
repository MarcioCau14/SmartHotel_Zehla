import { prisma } from '@/lib/prisma';

/**
 * ZEHLA LGPD Audit Logger
 * Registra acesso e modificação de dados PII (Pessoalmente Identificáveis)
 * para conformidade com a Lei Geral de Proteção de Dados (LGPD).
 *
 * Art. 5º - Dados pessoais: informação relacionada a pessoa natural identificada ou identificável.
 * Art. 18 - Direitos do titular: acesso, correção, anonimização, bloqueio, eliminação, portabilidade.
 */

export type PiiAction =
  | 'PII_ACCESS'
  | 'PII_CREATE'
  | 'PII_UPDATE'
  | 'PII_DELETE'
  | 'PII_EXPORT'
  | 'PII_ANONYMIZE'
  | 'PII_CONSENT_GIVEN'
  | 'PII_CONSENT_REVOKED'
  | 'DATA_SUBJECT_REQUEST'
  | 'DATA_EXPORT'
  | 'DATA_DELETION';

export interface AuditLogEntry {
  userId?: string;
  tenantId: string;
  action: PiiAction;
  resource: string;
  resourceId?: string;
  piiFields?: string[];
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

const ACTION_SEVERITY: Record<PiiAction, string> = {
  PII_ACCESS: 'INFO',
  PII_CREATE: 'INFO',
  PII_UPDATE: 'INFO',
  PII_DELETE: 'CRITICAL',
  PII_EXPORT: 'WARN',
  PII_ANONYMIZE: 'CRITICAL',
  PII_CONSENT_GIVEN: 'INFO',
  PII_CONSENT_REVOKED: 'WARN',
  DATA_SUBJECT_REQUEST: 'WARN',
  DATA_EXPORT: 'WARN',
  DATA_DELETION: 'CRITICAL',
};

export async function logPiiAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: entry.tenantId,
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        severity: ACTION_SEVERITY[entry.action] || 'INFO',
        piiFields: entry.piiFields || [],
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        metadata: entry.metadata ? JSON.parse(JSON.stringify(entry.metadata)) : undefined,
      },
    });
  } catch (error) {
    console.error('[LGPD Audit] Failed to log PII audit event:', error);
  }
}

/**
 * Middleware wrapper: logs PII access for API routes that handle guest data.
 * Usage: wrap your handler with this to auto-log PII access.
 */
export function withPiiAudit<T extends { tenantId: string; userId?: string }>(
  handler: (entry: T) => Promise<void>,
  resource: string,
  piiFields: string[]
) {
  return async (entry: T & { ipAddress?: string; userAgent?: string }) => {
    await logPiiAudit({
      userId: entry.userId,
      tenantId: entry.tenantId,
      action: 'PII_ACCESS',
      resource,
      piiFields,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
    });
    return handler(entry);
  };
}

/**
 * Helper: extract PII fields from a request body for audit logging.
 */
export function extractPiiFields(body: Record<string, unknown>): string[] {
  const piiKeys = [
    'name', 'email', 'phone', 'whatsapp', 'cpf', 'cnpj',
    'guestName', 'guestEmail', 'guestPhone', 'guestCpf',
    'address', 'zipCode', 'birthDate',
  ];
  return Object.keys(body).filter(k => piiKeys.includes(k));
}

/**
 * Data Subject Rights (LGPD Art. 18)
 * Export all PII data for a specific user/guest.
 */
export async function exportUserData(userId: string, tenantId: string) {
  const [user, reservations, messages] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, phone: true, cpf: true, createdAt: true },
    }),
    prisma.reservation.findMany({
      where: { property: { userId } },
      select: { id: true, guestName: true, guestEmail: true, guestPhone: true, guestCpf: true, checkIn: true, checkOut: true },
    }),
    prisma.message.findMany({
      where: { property: { userId } },
      select: { id: true, phone: true, name: true, content: true, createdAt: true },
    }),
  ]);

  await logPiiAudit({
    userId,
    tenantId,
    action: 'DATA_EXPORT',
    resource: 'user_data_export',
    piiFields: ['email', 'name', 'phone', 'cpf', 'guestName', 'guestEmail', 'guestPhone', 'guestCpf'],
    metadata: { reservationCount: reservations.length, messageCount: messages.length },
  });

  return { user, reservations, messages };
}

/**
 * Data Subject Rights (LGPD Art. 18)
 * Anonymize all PII data for a specific user/guest.
 */
export async function anonymizeUserData(userId: string, tenantId: string) {
  const anonymizedName = `Usuário_${userId.slice(0, 8)}`;
  const anonymizedEmail = `anon_${userId}@zehla.local`;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { name: anonymizedName, email: anonymizedEmail, phone: null, cpf: null },
    }),
  ]);

  await logPiiAudit({
    userId,
    tenantId,
    action: 'PII_ANONYMIZE',
    resource: 'user_data_anonymization',
    piiFields: ['name', 'email', 'phone', 'cpf'],
    metadata: { anonymizedName },
  });
}
