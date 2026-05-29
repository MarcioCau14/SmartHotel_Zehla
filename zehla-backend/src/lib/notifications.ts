import { getWhatsAppPort } from '@/infrastructure/external/evolution';

/**
 * Envia alerta administrativo via WhatsApp.
 * Usa a porta IWhatsAppPort (Evolution API) — sem dependência direta de axios/fetch.
 */
export async function sendWhatsAppAlert(message: string): Promise<boolean> {
  try {
    const targetPhone = process.env.ADMIN_WHATSAPP_NUMBER || '';
    if (!targetPhone) {
      console.log('ADMIN_WHATSAPP_NUMBER não configurado. Simulando envio:', message);
      return true;
    }

    const port = getWhatsAppPort();
    const result = await port.sendText({ to: targetPhone, content: message });

    if (!result.success) {
      console.error('Falha ao enviar notificação WhatsApp:', result.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro na integração com Evolution API:', error);
    return false;
  }
}
