// src/lib/eventTracker.ts — ZEHLA Brain v4: Client-Side Event Tracking
// Módulo para enviar eventos do frontend para a pipeline cognitiva

const TRACK_ENDPOINT = '/api/events/track';

/**
 * Gera um fingerprint único do dispositivo via crypto.subtle
 */
async function generateFingerprint(): Promise<string> {
  try {
    const data = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.hardwareConcurrency?.toString() || '',
    ].join('|');

    const encoder = new TextEncoder();
    const hash = await crypto.subtle.digest('SHA-256', encoder.encode(data));
    const hashArray = Array.from(new Uint8Array(hash));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
  } catch {
    return 'unknown-' + Math.random().toString(36).slice(2, 10);
  }
}

// Cache do fingerprint
let cachedFingerprint: string | null = null;

/**
 * Envia um evento para a pipeline ZEHLA Brain
 */
export async function trackEvent(
  email: string | null | undefined,
  eventType: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean; trackingId?: string }> {
  try {
    if (!cachedFingerprint) {
      cachedFingerprint = await generateFingerprint();
    }

    const response = await fetch(TRACK_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email || 'anonymous@zehla.com', // Placeholder para eventos sem e-mail mapeado
        eventType,
        fingerprint: cachedFingerprint,
        sessionId: getSessionId(),
        metadata: {
          ...metadata,
          page: typeof window !== 'undefined' ? window.location.pathname : '',
          referrer: typeof document !== 'undefined' ? document.referrer : '',
          timestamp: new Date().toISOString(),
        },
      }),
    });

    if (!response.ok) return { success: false };

    const data = await response.json();
    return { success: true, trackingId: data.trackingId };
  } catch (error) {
    console.warn('[EventTracker] Falha ao enviar evento:', error);
    return { success: false };
  }
}

/**
 * Gera/recupera ID de sessão persistente
 */
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  
  const key = 'zehla_session_id';
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = 'ses_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
}

export { generateFingerprint, getSessionId };
