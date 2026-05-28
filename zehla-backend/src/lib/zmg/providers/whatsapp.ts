/**
 * ZMG WhatsApp Provider — DEPRECATED
 * Use getWhatsAppPort() from @/infrastructure/external/evolution instead.
 */
import { getWhatsAppPort } from '@/infrastructure/external/evolution';

export interface WhatsAppResponse {
  success: boolean;
  externalId?: string;
  error?: string;
}

export class WhatsAppProvider {
  static async sendText(phone: string, text: string): Promise<WhatsAppResponse> {
    const result = await getWhatsAppPort().sendText({ to: phone, content: text });
    return result;
  }
}
