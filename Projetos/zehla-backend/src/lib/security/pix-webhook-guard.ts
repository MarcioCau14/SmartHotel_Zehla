import { timingSafeEqual } from 'crypto';

export type PixGateway = 'asaas' | 'pagarme' | 'mercadopago' | 'openpix';

interface WebhookConfig {
  secret: string;
  headerName: string;
  signaturePrefix?: string; // ex: "sha256="
}

const gatewayConfig: Record<PixGateway, WebhookConfig> = {
  asaas: { secret: process.env.ASAAS_WEBHOOK_SECRET || '', headerName: 'asaas-signature' },
  pagarme: { secret: process.env.PAGARME_WEBHOOK_SECRET || '', headerName: 'x-hub-signature', signaturePrefix: 'sha256=' },
  mercadopago: { secret: process.env.MP_WEBHOOK_SECRET || '', headerName: 'x-signature' },
  openpix: { secret: process.env.OPENPIX_WEBHOOK_SECRET || '', headerName: 'x-webhook-signature' },
};

/**
 * Valida assinatura HMAC-SHA256 em tempo constante.
 */
export async function validatePixWebhook(
  gateway: PixGateway,
  payload: string,        // raw body, NÃO parseado
  headers: Headers
): Promise<{ valid: boolean; reason?: string }> {
  const config = gatewayConfig[gateway];
    
  if (!config) {
    return { valid: false, reason: 'GATEWAY_UNKNOWN' };
  }

  const receivedSignature = headers.get(config.headerName);
  if (!receivedSignature) {
    return { valid: false, reason: 'SIGNATURE_MISSING' };
  }

  // Limpa prefixo se existir (ex: "sha256=abc123")
  const cleanSignature = config.signaturePrefix 
    ? receivedSignature.replace(config.signaturePrefix, '') 
    : receivedSignature;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(config.secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    const computedSignature = Buffer.from(signatureBuffer).toString('hex');

    // ⏱️ Timing-safe comparison — previne timing attacks
    const receivedBuffer = Buffer.from(cleanSignature, 'hex');
    const computedBuffer = Buffer.from(computedSignature, 'hex');

    if (receivedBuffer.length !== computedBuffer.length) {
      return { valid: false, reason: 'SIGNATURE_LENGTH_MISMATCH' };
    }

    const isValid = timingSafeEqual(receivedBuffer, computedBuffer);
      
    return isValid 
      ? { valid: true } 
      : { valid: false, reason: 'SIGNATURE_INVALID' };

  } catch (error) {
    return { valid: false, reason: 'VALIDATION_ERROR' };
  }
}
