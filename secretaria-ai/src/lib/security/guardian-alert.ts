import { prisma } from '../prisma';

interface AlertPayload {
  alertType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tenantId?: string;
  metadata: Record<string, any>;
}

export async function fireGuardianAlert(payload: AlertPayload): Promise<void> {
  console.log(`🚨 [GUARDIAN ALERT] ${payload.alertType} (${payload.severity})`);

  void (async () => {
    try {
      await prisma.securityAlert.create({
        data: {
          tenantId: payload.tenantId || 'SYSTEM',
          alertType: payload.alertType,
          severity: payload.severity,
          metadata: JSON.stringify(payload.metadata),
        }
      });
    } catch (e) {
      console.error('[Guardian] Alert persistence failed:', e);
    }
  })();
}
