export async function sendWhatsAppAlert(message: string): Promise<boolean> {
  try {
    const evoUrl = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
    const evoKey = process.env.EVOLUTION_API_KEY || '';
    const targetPhone = process.env.ADMIN_WHATSAPP_NUMBER || '';

    if (!evoKey || !targetPhone) {
      console.log('Evolution API não configurada. Simulando envio de mensagem:', message);
      return true;
    }

    const res = await fetch(`${evoUrl}/message/sendText/zehla-bot`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evoKey
      },
      body: JSON.stringify({
        number: targetPhone,
        options: {
          delay: 1200,
          presence: 'composing'
        },
        textMessage: {
          text: message
        }
      })
    });

    if (!res.ok) {
      console.error('Falha ao enviar notificação via Evolution API', await res.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro na integração com Evolution API:', error);
    return false;
  }
}
