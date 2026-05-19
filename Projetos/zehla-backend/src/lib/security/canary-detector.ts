import { fireGuardianAlert } from './guardian-alert';


/**
 * ZEHLA Canary Detector
 * Detecta se algum registro retornado pelo banco de dados é um "Canary" (Honeypot).
 */

export function detectCanary(result: unknown, model: string, action: string) : void {
  if (!result) return;

  const records = Array.isArray(result) ? result : [result];
  const touchedCanaries = records.filter((r: unknown) => r?.isCanary === true);

  if (touchedCanaries.length > 0) {
    void (async () => {
      try {
        for (const canary of touchedCanaries) {
          await fireGuardianAlert({
            alertType: 'CANARY_TOUCHED',
            severity: 'CRITICAL',
            tenantId: canary.userId || canary.tenantId || 'UNKNOWN',
            metadata: {
              canaryId: canary.id,
              table: model,
              action: action,
              timestamp: new Date().toISOString(),
            },
          });
        }
      } catch (e) {
        console.error('[CanaryDetector] Alert failed:', e);
      }
    })();
  }
}
