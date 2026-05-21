import { prisma } from '../../prisma';
import { sanitizePrompt, scanAndMaskPII } from '../../security/pii-scanner';

export class SecurityProcessor {
  static async validate(message: string, propertyId: string) {
    const sanitizedInput = sanitizePrompt(message);
    const hasInjectionAttempt = sanitizedInput.includes('[REDACTED_ATTEMPT]');

    if (hasInjectionAttempt) {
      await prisma.securityAlert.create({
        data: {
          tenantId: propertyId,
          alertType: 'PROMPT_INJECTION',
          severity: 'HIGH',
          metadata: JSON.stringify({ originalMessage: message })
        }
      });
      return { 
        success: false, 
        error: 'Desculpe, ocorreu uma violação das políticas de segurança na sua mensagem.' 
      };
    }

    const piiResult = scanAndMaskPII(sanitizedInput);
    return { 
      success: true, 
      safeMessage: piiResult.masked,
      hasPII: piiResult.hasPII,
      detectedTypes: piiResult.detectedTypes
    };
  }
}
