import crypto from 'crypto';

const META_APP_SECRET = process.env.META_APP_SECRET || 'zehla_dev_meta_secret_2026';
const WEBHOOK_URL = 'http://localhost:3000/api/webhooks/social';

const payload = {
  object: 'instagram',
  entry: [{
    id: '1234567890',
    time: Math.floor(Date.now() / 1000),
    changes: [{
      field: 'comments',
      value: {
        id: '1789',
        text: 'Qual o valor da diária para o próximo feriado?',
        from: { id: '9876', username: 'lead_quente_teste' },
        verb: 'comment',
      },
    }],
  }],
};

const body = JSON.stringify(payload);

const signature = crypto
  .createHmac('sha256', META_APP_SECRET)
  .update(body)
  .digest('hex');

async function triggerWebhook() {
  console.log('[Simulador] Disparando evento para o Webhook ZEHLA...');
  console.log(`[Simulador] X-Hub-Signature-256: sha256=${signature.slice(0, 16)}...`);

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': `sha256=${signature}`,
      },
      body: body,
    });

    const text = await response.text();
    console.log(`[Simulador] Status: ${response.status}`);
    console.log(`[Simulador] Resposta: ${text}`);

    if (response.ok) {
      console.log('[Simulador] ✅ Evento aceito! Pipeline HMAC → Next.js OK.');
    } else {
      console.log('[Simulador] ❌ Falha. HMACValidator pode ter bloqueado.');
    }
  } catch (error) {
    console.error('[Simulador] Erro de rede. O Next.js está rodando?', error);
  }

  console.log('[Simulador] Teste com assinatura INVÁLIDA...');
  try {
    const response2 = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Hub-Signature-256': 'sha256=invalida0000000000000000000000000000000000000000000000000000',
      },
      body: body,
    });
    console.log(`[Simulador] Status (assinatura inválida): ${response2.status} — ${response2.status === 401 ? '✅ Bloqueado corretamente' : '❌ Era esperado 401'}`);
  } catch (error) {
    console.error('[Simulador] Erro:', error);
  }
}

triggerWebhook();
